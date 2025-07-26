const axios = require('axios');
const { performance } = require('node:perf_hooks');

const TARGET = process.env.EMAIL_SERVICE_REST_URL || 'http://localhost:4000/email/send';
const TOTAL = 10000;
const CONCURRENCY = 20;

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

async function sendOne(dto) {
    try {
        await axios.post(TARGET, dto);
    } catch (error) {
        console.error("Error sending email", error);
        throw error;
    }
}

async function worker(count) {
    const dto = makeRequest();
    const results = [];
    for (let i = 0; i < count; i++) {
        results.push(sendOne(dto));
    }
    await Promise.all(results);
}

(async () => {
    const perWorker = Math.floor(TOTAL / CONCURRENCY);
    const start = performance.now();

    await Promise.all(
        Array.from({ length: CONCURRENCY }, () => worker(perWorker))
    );

    const end = performance.now();
    console.log(`rest api: ${TOTAL} calls in ${(end - start) / 1000}s`);
})();
