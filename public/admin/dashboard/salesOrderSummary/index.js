
window.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem("token");
    const form = document.querySelector("form");
    const tbody = document.getElementById("summary-body");

    // Initial fetch with no filters
    fetchSalesOrderSummary();

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const params = new URLSearchParams(new FormData(form));
        fetchSalesOrderSummary(params.toString());
    });

    function fetchSalesOrderSummary(queryParams = "") {
        fetch(`/saleOrders/admin/dashboard/salesOrderSummary?${queryParams}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(body => {
                if (body.error) throw new Error(body.error);

                const grouped = {};

                // Group rows by age group
                body.summary.forEach(row => {
                    const ageGroup = row.ageGroup;  // match the exact DB column name
                    if (!grouped[ageGroup]) {
                        grouped[ageGroup] = {
                            totalSpending: 0,
                            memberCount: new Set()
                        };
                    }

                    grouped[ageGroup].totalSpending += parseFloat(row.totalSpending);
                    grouped[ageGroup].memberCount.add(`${row.gender}-${row.product_type}-${row.age_group}`);
                });

                tbody.innerHTML = "";
                for (const [ageGroup, data] of Object.entries(grouped)) {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${ageGroup}</td>
                        <td>${data.totalSpending.toFixed(2)}</td>
                        <td>${data.memberCount.size}</td>
                    `;
                    tbody.appendChild(tr);
                }
            })
            .catch(error => {
                console.error(error);
                tbody.innerHTML = `<tr><td colspan="3">Failed to load summary: ${error.message}</td></tr>`;
            });
    }
});
