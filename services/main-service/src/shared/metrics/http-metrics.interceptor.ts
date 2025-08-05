import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { tap, catchError } from "rxjs/operators";
import { Counter, Histogram } from "prom-client";
import { InjectMetric } from "@willsoto/nestjs-prometheus";

interface HttpRequest {
  method: string;
  route?: { path: string };
  url: string;
}
interface HttpResponse {
  statusCode: number;
}

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  constructor(
    @InjectMetric("http_requests_total")
    private readonly counter: Counter<string>,
    @InjectMetric("http_request_duration_seconds")
    private readonly histogram: Histogram<string>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<HttpRequest>();
    const res = ctx.getResponse<HttpResponse>();
    const route = req.route?.path ?? req.url;
    const method = req.method;

    const labels = { method, path: route };
    const endTimer = this.histogram.startTimer(labels);

    return next.handle().pipe(
      tap(() => {
        const status = String(res.statusCode);
        this.counter.inc({ ...labels, status });
        endTimer({ status });
      }),
      catchError((err: unknown) => {
        const status =
          typeof err === "object" && err !== null && "status" in err
            ? String((err as { status: number }).status)
            : "500";

        this.counter.inc({ ...labels, status });
        endTimer({ status });
        return throwError(() => err);
      }),
    );
  }
}
