const { performance } = require('node:perf_hooks');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('node:path');

const PROTO_PATH = path.resolve(__dirname, '../services/email-service/proto/email.proto');

const packageDef = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true
});
const loaded = grpc.loadPackageDefinition(packageDef);

const emailPkg = loaded.email || loaded;
const EmailService = emailPkg.EmailService;

const client = new EmailService(
    'localhost:50051',
    grpc.credentials.createInsecure()
);

function makeRequest() {
    return {
        email: 'a@b.com',
        template: 'confirm-subscription',
        subject: 'Benchmark',
        context: {
            city: 'TestCity',
            confirmUrl: 'http://x/confirm',
            unsubscribeUrl: 'http://x/unsub',
            greeting: 'Hello!',
            weather: {
                temperature: 25,
                humidity: 60,
                description: 'sunny'
            }
        }
    };
}

function sendOne(req) {
    return new Promise((resolve, reject) => {
        client.Send(req, (err, res) => {
            if (err) reject(err);
            else resolve(res);
        });
    });
}

async function worker(count) {
    const req = makeRequest();
    const results = [];
    for (let i = 0; i < count; i++) {
        results.push(sendOne(req));
    }
    return Promise.all(results);
}

(async () => {
    const TOTAL = 10000;
    const CONCURRENCY = 20;
    const perWorker = Math.floor(TOTAL / CONCURRENCY);

    console.log(`grpc benchmark: ${TOTAL} calls @ ${CONCURRENCY} concurrency`);

    const start = performance.now();
    await Promise.all(
        Array.from({ length: CONCURRENCY }, () => worker(perWorker))
    );
    const end = performance.now();

    console.log(`grpc: ${TOTAL} calls in ${((end - start) / 1000).toFixed(2)}s`);
    client.close();
})();
