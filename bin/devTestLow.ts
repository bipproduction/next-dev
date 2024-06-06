import autocannon, { Result } from 'autocannon';
import 'colors';

export default async function devTestLow(argv: any) {
    try {
        // Function to display a progress animation with text
        const displayProgress = (url: string) => {
            const frames = ['|', '/', '-', '\\'];
            let i = 0;
            let percent = 0;
            const interval = setInterval(() => {
                process.stdout.write(`\rTesting ${url} ${frames[i]} Please wait... ${percent}%`.white);
                i = (i + 1) % frames.length;
                percent += 1;
                if (percent >= 100) {
                    clearInterval(interval);
                }
            }, 250);
            return interval;
        };

        // Start the progress animation
        const testUrl = 'https://wibudev.com'; // URL to test
        const progressInterval = displayProgress(testUrl);

        const testOptions = {
            url: testUrl,
            connections: 10, // Number of connections to use during the test
            duration: 20, // Duration of the test in seconds
            pipelining: 1, // Number of pipelined requests per connection
            overallRate: 100, // Maximum rate of requests per second
            workers: 1, // Number of worker threads
        };

        autocannon(
            testOptions,
            (err: Error | null, result?: Result) => {
                // Stop the progress animation
                clearInterval(progressInterval);

                if (err) {
                    console.error('Error during load testing:'.red, err);
                    return;
                }

                if (!result) {
                    console.error('No load test results received'.red);
                    return;
                }
                // Print the results in a human-readable format
                console.log('\n\nLoad Test Results:'.white);
                console.log('-------------------'.white);
                console.log('Headers:'.white);
                console.log('  - URL:'.white, `${testOptions.url} [URL yang diuji]`.gray);
                console.log('  - Connections:'.white, `${testOptions.connections} [Jumlah koneksi]`.gray);
                console.log('  - Duration:'.white, `${testOptions.duration} seconds [Durasi pengujian]`.gray);
                console.log('  - Pipelining:'.white, `${testOptions.pipelining} [Jumlah permintaan yang dipipelin]`.gray);
                console.log('  - Overall Rate:'.white, `${testOptions.overallRate} requests per second [Rate maksimum permintaan]`.gray);
                console.log('  - Workers:'.white, `${testOptions.workers} [Jumlah thread worker]`.gray);
                console.log('-------------------'.white);
                console.log('Requests per second:'.white, result.requests.average.toFixed(2), '[Rata-rata permintaan per detik]'.gray);
                console.log('Latency (ms):'.white);
                console.log('  - p50:'.white, result.latency.p50.toFixed(2), '[Waktu respon 50% permintaan]'.gray);
                console.log('  - p90:'.white, result.latency.p90.toFixed(2), '[Waktu respon 90% permintaan]'.gray);
                console.log('  - p99:'.white, result.latency.p99.toFixed(2), '[Waktu respon 99% permintaan]'.gray);
                console.log('Throughput (bytes/sec):'.white);
                console.log('  - Mean:'.white, result.throughput.mean.toFixed(2), '[Rata-rata data yang diproses per detik]'.gray);
                console.log('  - Standard Deviation:'.white, result.throughput.stddev.toFixed(2), '[Variasi throughput]'.gray);
                console.log('Errors:'.white, result.errors);

                // Evaluate the results and provide a conclusion
                const rps = result.requests.average;
                const latencyP99 = result.latency.p99;
                const throughput = result.throughput.mean;

                let conclusion = '\n\nKondisi situs web dapat dianggap:'.white;
                conclusion += `\n  - RPS: ${rps.toFixed(2)} [Rata-rata permintaan per detik]`.white
                    + `\n  - Latency P99: ${latencyP99.toFixed(2)} ms [Waktu respon 99% permintaan]`.white
                    + `\n  - Throughput: ${throughput.toFixed(2)} bytes/sec [Rata-rata data yang diproses per detik]`.white;

                if (rps > 100 && latencyP99 < 200 && throughput > 500000) {
                    conclusion += '\n  - Sangat baik. [Situs memiliki performa yang sangat baik]'.green;
                } else if (rps > 50 && latencyP99 < 400 && throughput > 200000) {
                    conclusion += '\n  - Bagus. [Situs memiliki performa yang baik]'.blue;
                } else if (rps > 20 && latencyP99 < 600 && throughput > 100000) {
                    conclusion += '\n  - Cukup baik. [Situs memiliki performa yang cukup baik]'.cyan;
                } else if (rps > 10 && latencyP99 < 800 && throughput > 50000) {
                    conclusion += '\n  - Kurang memuaskan. [Situs memiliki performa yang kurang memuaskan]'.yellow;
                } else {
                    conclusion += '\n  - Buruk. [Situs memiliki performa yang buruk]'.red;
                }

                console.log(conclusion);
            }
        );
    } catch (error) {
        console.error('Error during load test:'.red, error);
    }
}
