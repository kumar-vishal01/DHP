document.addEventListener("DOMContentLoaded", function () {
    const showChartBtn = document.getElementById("showChartBtn");
    const goBackBtn = document.getElementById("goBackBtn");
    const hero = document.getElementById("hero");
    const chartScreen = document.getElementById("chartScreen");
    let chartInstance = null; // Store the chart instance

    showChartBtn.addEventListener("click", () => {
        hero.classList.add("hidden");
        chartScreen.classList.remove("hidden");
        loadChart(); // Load the chart every time
    });

    goBackBtn.addEventListener("click", () => {
        chartScreen.classList.add("hidden");
        hero.classList.remove("hidden");
        if (chartInstance) {
            chartInstance.destroy(); // Destroy the chart when going back
            chartInstance = null;
        }
    });

    function loadChart() {
        fetch("http://127.0.0.1:5000/data")
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                const years = Object.keys(data);
                const tags = Object.keys(data[years[0]]);

                // Destroy previous chart if it exists
                if (chartInstance) {
                    chartInstance.destroy();
                }

                const datasets = tags.map((tag, i) => ({
                    label: tag,
                    data: years.map(year => data[year][tag] || 0),
                    borderColor: getColor(i),
                    backgroundColor: getColor(i),
                    tension: 0.4,
                    pointBackgroundColor: getColor(i),
                    pointBorderColor: getColor(i),
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }));

                const ctx = document.getElementById("lineChart").getContext("2d");
                chartInstance = new Chart(ctx, {  // Assign to chartInstance
                    type: "line",
                    data: {
                        labels: years,
                        datasets: datasets
                    },
                    options: {
                        responsive: true,
                        interaction: {
                            mode: 'nearest',
                            axis: 'x',
                            intersect: false
                        },
                        plugins: {
                            legend: { position: "top" },
                            tooltip: {
                                callbacks: {
                                    label: function (context) {
                                        return `${context.dataset.label}: ${context.formattedValue}%`;
                                    }
                                }
                            },
                            title: {
                                display: true,
                                text: "Top 10 Tags by Percentage (2023–2025)",
                                font: { size: 18 }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: { display: true, text: "Percentage (%)" },
                                ticks: { color: '#333', font: { weight: 'bold' } }
                            },
                            x: {
                                title: { display: true, text: "Year" },
                                ticks: { color: '#333', font: { weight: 'bold' } }
                            }
                        }
                    }
                });
            })
            .catch(error => {
                console.error("Error loading data:", error);
                document.body.innerHTML += "<p style='color:red;'>Error loading chart. Please try again later.</p>";
            });
    }

    const colorPalette = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
        '#9966FF', '#FF9F40', '#66FF66', '#FF66B2',
        '#66B2FF', '#D1AFFF'
    ];

    function getColor(index) {
        return colorPalette[index % colorPalette.length];
    }
});
