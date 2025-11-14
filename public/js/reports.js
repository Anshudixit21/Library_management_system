async function loadReports(type) {
    try {
        const response = await fetch(`${API_BASE}/reports?type=${type}`, {
            headers: getAuthHeaders()
        });
        
        const data = await response.json();
        displayReport(type, data);
    } catch (error) {
        const contentDiv = document.getElementById('reportsContent');
        contentDiv.innerHTML = '<div class="error-message show">Failed to load reports</div>';
    }
}

function displayReport(type, data) {
    const contentDiv = document.getElementById('reportsContent');
    let html = '<div class="form-container">';
    
    switch(type) {
        case 'transactions':
            html += '<h2>Transactions Report</h2>';
            if (data.transactions && data.transactions.length > 0) {
                html += '<div class="table-container"><table><thead><tr><th>Book Name</th><th>Author</th><th>Serial No</th><th>Membership No</th><th>Issue Date</th><th>Return Date</th><th>Status</th><th>Fine Amount</th></tr></thead><tbody>';
                data.transactions.forEach(t => {
                    html += `
                        <tr>
                            <td>${t.bookName}</td>
                            <td>${t.author}</td>
                            <td>${t.serialNo}</td>
                            <td>${t.membershipNumber}</td>
                            <td>${formatDate(t.issueDate)}</td>
                            <td>${formatDate(t.returnDate)}</td>
                            <td>${t.status}</td>
                            <td>₹${t.fineAmount || 0}</td>
                        </tr>
                    `;
                });
                html += '</tbody></table></div>';
            } else {
                html += '<p>No transactions found.</p>';
            }
            break;
            
        case 'books':
            html += '<h2>Books Report</h2>';
            html += `<div class="card-grid">
                <div class="card">
                    <h3>Total Books</h3>
                    <p style="font-size: 24px; font-weight: bold;">${data.books ? data.books.length : 0}</p>
                </div>
                <div class="card">
                    <h3>Available Books</h3>
                    <p style="font-size: 24px; font-weight: bold;">${data.availableBooks || 0}</p>
                </div>
                <div class="card">
                    <h3>Issued Books</h3>
                    <p style="font-size: 24px; font-weight: bold;">${data.issuedBooks || 0}</p>
                </div>
            </div>`;
            
            if (data.books && data.books.length > 0) {
                html += '<div class="table-container"><table><thead><tr><th>Name</th><th>Author</th><th>Type</th><th>Serial No</th><th>Available</th></tr></thead><tbody>';
                data.books.forEach(book => {
                    html += `
                        <tr>
                            <td>${book.name}</td>
                            <td>${book.author}</td>
                            <td>${book.type}</td>
                            <td>${book.serialNo}</td>
                            <td>${book.isAvailable ? 'Yes' : 'No'}</td>
                        </tr>
                    `;
                });
                html += '</tbody></table></div>';
            }
            break;
            
        case 'memberships':
            html += '<h2>Memberships Report</h2>';
            html += `<div class="card-grid">
                <div class="card">
                    <h3>Total Memberships</h3>
                    <p style="font-size: 24px; font-weight: bold;">${data.memberships ? data.memberships.length : 0}</p>
                </div>
                <div class="card">
                    <h3>Active Memberships</h3>
                    <p style="font-size: 24px; font-weight: bold;">${data.activeMemberships || 0}</p>
                </div>
                <div class="card">
                    <h3>Inactive Memberships</h3>
                    <p style="font-size: 24px; font-weight: bold;">${data.inactiveMemberships || 0}</p>
                </div>
            </div>`;
            
            if (data.memberships && data.memberships.length > 0) {
                html += '<div class="table-container"><table><thead><tr><th>Membership No</th><th>Name</th><th>Email</th><th>Type</th><th>Start Date</th><th>End Date</th><th>Status</th></tr></thead><tbody>';
                data.memberships.forEach(m => {
                    html += `
                        <tr>
                            <td>${m.membershipNumber}</td>
                            <td>${m.name}</td>
                            <td>${m.email}</td>
                            <td>${m.membershipType}</td>
                            <td>${formatDate(m.startDate)}</td>
                            <td>${formatDate(m.endDate)}</td>
                            <td>${m.isActive ? 'Active' : 'Inactive'}</td>
                        </tr>
                    `;
                });
                html += '</tbody></table></div>';
            }
            break;
            
        case 'fines':
            html += '<h2>Fines Report</h2>';
            if (data.fines) {
                html += `<div class="card-grid">
                    <div class="card">
                        <h3>Total Fines</h3>
                        <p style="font-size: 24px; font-weight: bold;">₹${data.fines.totalFines || 0}</p>
                    </div>
                    <div class="card">
                        <h3>Paid Fines</h3>
                        <p style="font-size: 24px; font-weight: bold;">₹${data.fines.paidFines || 0}</p>
                    </div>
                    <div class="card">
                        <h3>Pending Fines</h3>
                        <p style="font-size: 24px; font-weight: bold;">₹${data.fines.pendingFines || 0}</p>
                    </div>
                </div>`;
                
                if (data.fines.transactions && data.fines.transactions.length > 0) {
                    html += '<div class="table-container"><table><thead><tr><th>Book Name</th><th>Serial No</th><th>Membership No</th><th>Fine Amount</th><th>Paid</th></tr></thead><tbody>';
                    data.fines.transactions.forEach(t => {
                        html += `
                            <tr>
                                <td>${t.bookName}</td>
                                <td>${t.serialNo}</td>
                                <td>${t.membershipNumber}</td>
                                <td>₹${t.fineAmount || 0}</td>
                                <td>${t.finePaid ? 'Yes' : 'No'}</td>
                            </tr>
                        `;
                    });
                    html += '</tbody></table></div>';
                }
            } else {
                html += '<p>No fines data available.</p>';
            }
            break;
    }
    
    html += '</div>';
    contentDiv.innerHTML = html;
}

