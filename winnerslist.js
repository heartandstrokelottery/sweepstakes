document.getElementById('searchBtn').addEventListener('click', function() {
  const value = document.getElementById('searchInput').value.trim();
  if (value) {
    alert('Search for: ' + value);
    // You can implement actual search logic here
  }
});

const winners = [
  {
    name: "Eleanore Janz",
    ticket: "#42685",
    prizeAmount: "$1,000,000",
    prizeType: "Grand Prize",
    month: "October",
    city: "Calgary",
    cardClass: "grand-prize"
  },
  {
    name: "David J Morrison",
    ticket: "#21446",
    prizeAmount: "$100,000",
    prizeType: "2nd Prize",
    month: "November",
    city: "Peace River",
    cardClass: "second-prize"
  },
  {
    name: "Alice Johnson",
    ticket: "#34367",
    prizeAmount: "$50,000",
    prizeType: "3rd Prize",
    month: "March",
    city: "Montreal",
    cardClass: "third-prize"
  },
  {
    name: "Bob Lee",
    ticket: "#45678",
    prizeAmount: "$25,000",
    prizeType: "Early Bird",
    month: "April",
    city: "Calgary",
    cardClass: "early-bird"
  },
  {
    name: "Maria Garcia",
    ticket: "#56789",
    prizeAmount: "$10,000",
    prizeType: "Cash Prize",
    month: "May",
    city: "Ottawa",
    cardClass: "cash-prize"
  },
  {
    name: "David Kim",
    ticket: "#67890",
    prizeAmount: "$5,000",
    prizeType: "Cash Prize",
    month: "June",
    city: "Edmonton",
    cardClass: "cash-prize"
  },
  {
    name: "Emily Chen",
    ticket: "#78901",
    prizeAmount: "$2,500",
    prizeType: "Cash Prize",
    month: "July",
    city: "Winnipeg",
    cardClass: "cash-prize"
  },
  {
    name: "Michael Brown",
    ticket: "#89012",
    prizeAmount: "$1,000",
    prizeType: "Cash Prize",
    month: "August",
    city: "Halifax",
    cardClass: "cash-prize"
  },
  {
    name: "Sofia Martinez",
    ticket: "#90123",
    prizeAmount: "$1,000",
    prizeType: "Cash Prize",
    month: "September",
    city: "Victoria",
    cardClass: "cash-prize"
  },
  {
    name: "Chris Wilson",
    ticket: "#11234",
    prizeAmount: "$1,000",
    prizeType: "Cash Prize",
    month: "October",
    city: "Hamilton",
    cardClass: "cash-prize"
  },
  {
    name: "Olivia Davis",
    ticket: "#22345",
    prizeAmount: "$1,000",
    prizeType: "Cash Prize",
    month: "November",
    city: "Quebec City",
    cardClass: "cash-prize"
  },
  {
    name: "Ethan Clark",
    ticket: "#33456",
    prizeAmount: "$1,000",
    prizeType: "Cash Prize",
    month: "December",
    city: "Regina",
    cardClass: "cash-prize"
  },
  {
    name: "Grace Lee",
    ticket: "#44567",
    prizeAmount: "$1,000",
    prizeType: "Cash Prize",
    month: "January",
    city: "Saskatoon",
    cardClass: "cash-prize"
  },
  {
    name: "Daniel Evans",
    ticket: "#55678",
    prizeAmount: "$1,000",
    prizeType: "Cash Prize",
    month: "February",
    city: "St. John's",
    cardClass: "cash-prize"
  },
  {
    name: "Ava Thompson",
    ticket: "#66789",
    prizeAmount: "$1,000",
    prizeType: "Cash Prize",
    month: "March",
    city: "London",
    cardClass: "cash-prize"
  },
  {
    name: "Henry White",
    ticket: "#77890",
    prizeAmount: "$1,000",
    prizeType: "Cash Prize",
    month: "April",
    city: "Windsor",
    cardClass: "cash-prize"
  }
];

const winnersPerPage = 9;
let currentPage = 1;

// Prize Filter Logic
const prizeTypes = Array.from(new Set(winners.map(w => w.prizeType)));
let selectedPrizeType = null;

function renderPrizeFilters() {
  const filterList = document.getElementById('prizeFilterList');
  filterList.innerHTML = '';
  // Add 'All' button
  const allBtn = document.createElement('button');
  allBtn.textContent = 'All';
  allBtn.className = 'prize-filter-btn' + (selectedPrizeType === null ? ' active' : '');
  allBtn.onclick = () => {
    selectedPrizeType = null;
    currentPage = 1;
    renderPrizeFilters();
    renderWinners();
  };
  filterList.appendChild(allBtn);
  // Add buttons for each prize type
  prizeTypes.forEach(type => {
    const btn = document.createElement('button');
    btn.textContent = type;
    btn.className = 'prize-filter-btn' + (selectedPrizeType === type ? ' active' : '');
    btn.onclick = () => {
      selectedPrizeType = type;
      currentPage = 1;
      renderPrizeFilters();
      renderWinners();
    };
    filterList.appendChild(btn);
  });
}

function getFilteredWinners() {
  if (!selectedPrizeType) return winners;
  return winners.filter(w => w.prizeType === selectedPrizeType);
}

function renderWinners() {
  const filteredWinners = getFilteredWinners();
  const startIdx = (currentPage - 1) * winnersPerPage;
  const endIdx = startIdx + winnersPerPage;
  const pageWinners = filteredWinners.slice(startIdx, endIdx);
  const winnersList = document.getElementById('winnersList');
  winnersList.innerHTML = '';
  pageWinners.forEach(winner => {
    const tr = document.createElement('tr');
    tr.className = winner.cardClass;
    tr.innerHTML = `
      <td data-label="Name">${winner.name}</td>
      <td data-label="Ticket">${winner.ticket}</td>
      <td data-label="Prize Amount" class="winner-prize-amount">${winner.prizeAmount}</td>
      <td data-label="Prize Type" class="winner-prize-type">${winner.prizeType}</td>
      <td data-label="Month" class="winner-month">${winner.month}</td>
      <td data-label="City" class="winner-city">${winner.city}</td>
    `;
    winnersList.appendChild(tr);
  });
  updatePagination(filteredWinners.length);
}

function updatePagination(filteredLength) {
  const totalPages = Math.ceil(filteredLength / winnersPerPage);
  document.getElementById('prevPageBtn').disabled = currentPage === 1;
  document.getElementById('nextPageBtn').disabled = currentPage === totalPages || totalPages === 0;
  document.getElementById('pageIndicator').textContent = `Page ${totalPages === 0 ? 0 : currentPage} of ${totalPages}`;
}

document.getElementById('prevPageBtn').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderWinners();
  }
});

document.getElementById('nextPageBtn').addEventListener('click', () => {
  const filteredWinners = getFilteredWinners();
  const totalPages = Math.ceil(filteredWinners.length / winnersPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderWinners();
  }
});

// Initial render
renderPrizeFilters();
renderWinners();
