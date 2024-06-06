import autocannon, { Result } from 'autocannon';
import 'colors';

// Function to display a progress animation with text
const displayProgress = (url: string, duration: number) => {
    let percent = 0;
    const interval = setInterval(() => {
        process.stdout.write(`\rTesting ${url}... ${percent}%`.white);
        percent += 1;
        if (percent > 100) {
            clearInterval(interval);
        }
    }, (duration * 10)); // Adjust interval duration to fit the test duration
    return interval;
};

// Function to format and print the results
const printResults = (result: Result, testOptions: any) => {
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
    console.log('  - p50:'.white, result.latency.p50.toFixed(2), '[Latensi P50]'.gray);
    console.log('  - p90:'.white, result.latency.p90.toFixed(2), '[Latensi P90]'.gray);
    console.log('  - p99:'.white, result.latency.p99.toFixed(2), '[Latensi P99]'.gray);
    console.log('Throughput (bytes/sec):'.white);
    console.log('  - Mean:'.white, result.throughput.mean.toFixed(2), '[Rata-rata throughput]'.gray);
    console.log('  - Standard Deviation:'.white, result.throughput.stddev.toFixed(2), '[Standar Deviasi throughput]'.gray);
    console.log('Errors:'.white, result.errors);

    // Evaluate the results and provide a conclusion
    const rps = result.requests.average;
    const latencyP99 = result.latency.p99;
    const throughput = result.throughput.mean;

    let conclusion = '\n\nKondisi situs web dapat dianggap:'.white;
    conclusion += `\n  - RPS: ${rps.toFixed(2)} [Rata-rata permintaan per detik]`.white
        + `\n  - Latency P99: ${latencyP99.toFixed(2)} ms [Latensi P99]`.white
        + `\n  - Throughput: ${throughput.toFixed(2)} bytes/sec [Throughput rata-rata]`.white;

    let score = 0;

    // Adjusted scoring criteria
    if (rps > 1000 && latencyP99 < 2000 && throughput > 1000000) {
        conclusion += '\n  - Sangat baik. [Situs memiliki performa yang sangat baik]'.green;
        score = 90;
    } else if (rps > 500 && latencyP99 < 3000 && throughput > 500000) {
        conclusion += '\n  - Bagus. [Situs memiliki performa yang baik]'.blue;
        score = 75;
    } else if (rps > 200 && latencyP99 < 4000 && throughput > 200000) {
        conclusion += '\n  - Cukup baik. [Situs memiliki performa yang cukup baik]'.cyan;
        score = 60;
    } else if (rps > 100 && latencyP99 < 5000 && throughput > 100000) {
        conclusion += '\n  - Kurang memuaskan. [Situs memiliki performa yang kurang memuaskan]'.yellow;
        score = 40;
    } else {
        conclusion += '\n  - Buruk. [Situs memiliki performa yang buruk]'.red;
        score = 20;
    }

    conclusion += `\n  - Nilai: ${score}/100 [Nilai performa]`.white;
    console.log(conclusion);
};

export default async function devTest(argv: any) {
    try {
        const testUrl = argv.url; // URL to test
        const duration = 30; // Duration of the test in seconds (set based on testOptions below)
        const progressInterval = displayProgress(testUrl, duration);

        const testOptions = {
            url: testUrl,
            connections: 100, // Number of connections to use during the test
            duration: duration, // Duration of the test in seconds
            pipelining: 10, // Number of pipelined requests per connection
            overallRate: 1000, // Maximum rate of requests per second
            workers: 4, // Number of worker threads
        };

        autocannon(
            testOptions,
            (err: Error | null, result?: Result) => {
                clearInterval(progressInterval); // Stop the progress animation

                if (err) {
                    console.error('Error during load testing:'.red, err);
                    return;
                }

                if (!result) {
                    console.error('No load test results received'.red);
                    return;
                }

                printResults(result, testOptions); // Print the results in a human-readable format
            }
        );
    } catch (error) {
        console.error('Error during load test:'.red, error);
    }
}
