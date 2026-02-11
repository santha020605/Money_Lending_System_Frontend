function toggleNewLogin() {
    const form = document.getElementById("form2");
    form.style.display = (form.style.display === "none") ? "block" : "none";

}
function toggleUserLogin() {
    const form = document.getElementById("form1");
    form.style.display = (form.style.display === "none") ? "block" : "none";

}
function toggleAdminLogin() {
    const form = document.getElementById("form3");
    form.style.display = (form.style.display === "none") ? "block" : "none";

}

const apiUrl = "http://moneylendingsystembackend.railway.internal/api";
function loginBorrower() {
    const borrowerCredentials = {
        phone: document.getElementById("BorrowerPhone").value,
        password: document.getElementById("borrowerPassword").value
    };
    fetch(`${apiUrl}/borrowers/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(borrowerCredentials)
    }).then(res => {
        if (!res.ok) throw new Error("Invalid login");
        return res.json();
    })
        .then(data => {
            localStorage.setItem("borrowerId", data.id);
            localStorage.setItem("borrowerName", data.name);
            window.location.href = "borrower.html";
        })
        .catch(() => alert("Invalid Login"));
}
function loginManager() {
    const managerCredentials = {
        username: document.getElementById("adminName").value,
        password: document.getElementById("adminPassword").value
    };
    fetch(`${apiUrl}/managers/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(managerCredentials)
    }).then(res => {
        if (!res.ok) throw new Error("Invalid Credentials.");
        return res.json();
    }).then(data => {
        window.location.href = "manager_portal.html";
    })
        .catch(() => alert("Invalid Credentials."))
}
function initManagerPortal() {
    activeLoansList();
    appliedLoanList();
    dashBoard();
}
function dashBoard() {
    fetch(`${apiUrl}/managers/dashboard`)
        .then(res => res.json())
        .then(data => {
            console.log(data);
            document.getElementById("totalTransaction").innerText = `₹${data.totalTransactions.toLocaleString('en-IN')}`;
            document.getElementById("todayTransaction").innerHTML = `₹ ${data.todayTransactions.toLocaleString('en-IN')}`;
            document.getElementById("todayCollections").innerHTML = `₹ ${data.todayRepayments.toLocaleString('en-IN')}`;
        });

}
function initBorrowerPortal() {
    const borrowerId = localStorage.getItem("borrowerId");
    if (!borrowerId) {
        window.location.href = "index.html";
        return;
    }
    document.getElementById("borrowerName").innerText = localStorage.getItem("borrowerName");
    loadBorrowerLoan(borrowerId);
}
function loadBorrowerLoan(borrowerId) {
    fetch(`${apiUrl}/loans/current/${borrowerId}`)
        .then(res => res.json())
        .then(loan => {
            if (loan.status === "ACTIVE") {
                fillActiveLoan(loan);
            }
            if (loan.status === "APPLIED") {
                fillPendingLoan(loan);
            }
            if (loan.status === "COMPLETED") {
                fillActiveLoan(loan);
                document.getElementById("loanStatusHeader").innerText = "Congrats Your Loan is Completed !";
            }
        });
}
function fillActiveLoan(loan) {

    document.getElementById("loanStatusHeader").innerText = "Active Loan";
    document.getElementById("loanID").innerText = loan.id;
    document.getElementById("EMIAmount").innerText = "₹ "+loan.emiAmount.toLocaleString('en-IN');
    document.getElementById("dueDate").innerText = new Date().getDate() + "-" + new Date().getMonth() + "-" + new Date().getFullYear();

    document.getElementById("loanId").innerText = loan.id;
    document.getElementById("loanType").innerText = loan.type;
    document.getElementById("loanAmount").innerText = "₹"+loan.principalAmount.toLocaleString('en-IN');
    document.getElementById("interest").innerText = loan.interestRate + " %";
    document.getElementById("totalAmount").innerText = "₹"+loan.totalAmount.toLocaleString('en-IN');
    document.getElementById("tenure").innerText = loan.months + " Months";
    document.getElementById("emiAmount").innerText = "₹"+loan.emiAmount.toLocaleString('en-IN');
    document.getElementById("paid").innerText = "₹"+loan.totalPaid.toLocaleString('en-IN');
    document.getElementById("remaining").innerText = "₹"+loan.remainingDue.toLocaleString('en-IN');


}
function fillPendingLoan(loan) {
    document.getElementById("loanStatusHeader").innerText = "Loan is 'PENDING' Waiting for Approval";
    document.getElementById("loanID").innerText = loan.id;
    document.getElementById("EMIAmount").innerText = "PENDING";
    document.getElementById("dueDate").innerText = new Date().getDate() + "-" + new Date().getMonth() + "-" + new Date().getFullYear();

    document.getElementById("loanId").innerText = loan.id;
    document.getElementById("loanType").innerText = loan.type;
    document.getElementById("loanAmount").innerText ="₹"+ loan.principalAmount.toLocaleString('en-IN');
    document.getElementById("interest").innerText = loan.interestRate + " %";
    document.getElementById("totalAmount").innerText = "-";
    document.getElementById("tenure").innerText = loan.months + " Months";
    document.getElementById("emiAmount").innerText = "-";
    document.getElementById("paid").innerText = "-";
    document.getElementById("remaining").innerText = "-";
}
function registerBorrower() {
    const borrower = {
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value,
        address: document.getElementById("address").value,
        monthlyIncome: document.getElementById("monthlyIncome").value,
        password: document.getElementById("password").value
    };
    fetch(`${apiUrl}/borrowers/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(borrower)
    }).then(res => res.json())
        .then(data => {
            localStorage.setItem("borrowerId", data.id);
            window.location.href = "loan_apply_form.html";

        })
        .catch(err => alert("Error occured."))
}

function applyLoan(event) {
    event.preventDefault();
    const borrowerId = localStorage.getItem("borrowerId");
    const loanDetails = {
        type: document.getElementById("loanTypes").value,
        principalAmount: document.getElementById("loanAmount").value,
        months: document.getElementById("tenure").value
    }

    fetch(`${apiUrl}/loans/apply/${borrowerId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loanDetails)
    })
    .then(async res=>{
        const data = await res.json();
        if(!res.ok){
            throw new Error(data.message || "Loan Not Eligible.");
        }
        return data;
    })
    .then(() => {
        alert("Loan Applied Successfully");
        window.location.href = "index.html";
    }).catch(err => alert(err.message));
}

let activeLoans = [];
let visibleCount = 10;

function activeLoansList() {
    fetch(`${apiUrl}/loans/activeLoans`)
        .then(res => res.json())
        .then(loans => {
            activeLoans = loans;
            visibleCount = 10;
            renderActiveLoans();
        });
}

function renderActiveLoans() {
    const table = document.getElementById("activeLoansTable");
    table.innerHTML = "";

    activeLoans.slice(0, visibleCount).forEach(l => {
        table.innerHTML += `
        <tr>
            <td>${l.id}</td>
            <td>${l.borrower.name}</td>
            <td>₹${l.totalAmount.toLocaleString('en-IN')}</td>
            <td>₹${l.totalPaid.toLocaleString('en-IN')}</td>
            <td>₹${l.remainingDue.toLocaleString('en-IN')}</td>
        </tr>
        `;
    });
}
function loadMore() {
    visibleCount += 10;
    renderActiveLoans();
}
let loanRequests = [];
let visible = 2;

function appliedLoanList() {
    fetch(`${apiUrl}/loans/appliedLoans`)
        .then(res => res.json())
        .then(loans => {
            loanRequests = loans;
            visible = 2;
            renderLoanRequests();
        });
}
function renderLoanRequests() {
    const container = document.getElementById("loanRequestsTable");
    container.innerHTML = "";
    loanRequests.slice(0, visible).forEach(l => {
        container.innerHTML += `
        <div class="user-details">
            <div class="users">Borrower Name : ${l.borrower.name}</div>
            <div class="users">Phone : ${l.borrower.phone}</div>
            <div class="users">Loan Amount : ₹${l.principalAmount.toLocaleString('en-IN')}</div>
            <div class="users">Loan Type :  ${l.type}</div>
            <div class="users">Monthly Income :  ₹${l.borrower.monthlyIncome.toLocaleString('en-IN')}</div>
            <div class="actions">
                <button class="act-btn" id="btn1" onclick="approveLoan(${l.id})">Approve</button>
                <button class="act-btn" id="btn2" onclick="rejectLoan(${l.id})">Reject</button>
            </div>
        </div>
        `
    });
}
function loadMoreApplied() {
    visible += 2;
    renderLoanRequests();
}

function approveLoan(loanID){
    fetch(`${apiUrl}/loans/approve/${loanID}`,{
        method : "PUT"
    })
    .then(()=>{
        alert("Loan Approved");
        activeLoansList();
        appliedLoanList();
        dashBoard();
    });
    
}
function rejectLoan(loanID){
    fetch(`${apiUrl}/loans/reject/${loanID}`,{
        method : "PUT"
    })
    .then(()=>{
        alert("Loan Rejected");
        activeLoansList();
        appliedLoanList();
        dashBoard();
    });
    
}
