function showAddBook() {
    document.getElementById('addBookSection').style.display = 'block';
    document.getElementById('updateBookSection').style.display = 'none';
    document.getElementById('userManagementSection').style.display = 'none';
    document.getElementById('addBookForm').reset();
    document.querySelector('input[name="type"][value="book"]').checked = true;
}

function showUpdateBook() {
    document.getElementById('addBookSection').style.display = 'none';
    document.getElementById('updateBookSection').style.display = 'block';
    document.getElementById('userManagementSection').style.display = 'none';
    loadBooksForUpdate();
}

function showUserManagement() {
    document.getElementById('addBookSection').style.display = 'none';
    document.getElementById('updateBookSection').style.display = 'none';
    document.getElementById('userManagementSection').style.display = 'block';
    loadUsersForManagement();
}

document.getElementById('addBookForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const type = document.querySelector('input[name="type"]:checked').value;
    const name = document.getElementById('addBookName').value;
    const author = document.getElementById('addAuthor').value;
    const serialNo = document.getElementById('addSerialNo').value;
    
    if (!name || !author || !serialNo) {
        showError('addBookError', 'All fields are mandatory');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/books`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ name, author, type, serialNo })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showSuccess('addBookSuccess', 'Book added successfully');
            document.getElementById('addBookForm').reset();
            document.querySelector('input[name="type"][value="book"]').checked = true;
        } else {
            showError('addBookError', data.message || 'Failed to add book');
        }
    } catch (error) {
        showError('addBookError', 'Network error. Please try again.');
    }
});

async function loadBooksForUpdate() {
    try {
        const response = await fetch(`${API_BASE}/books`, {
            headers: getAuthHeaders()
        });
        
        const books = await response.json();
        const select = document.getElementById('updateBookId');
        select.innerHTML = '<option value="">Select a book</option>';
        
        books.forEach(book => {
            const option = document.createElement('option');
            option.value = book._id;
            option.textContent = `${book.name} (${book.serialNo})`;
            option.dataset.book = JSON.stringify(book);
            select.appendChild(option);
        });
    } catch (error) {
        showError('updateBookError', 'Failed to load books');
    }
}

document.getElementById('updateBookId').addEventListener('change', (e) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    if (selectedOption.value) {
        const book = JSON.parse(selectedOption.dataset.book);
        document.getElementById('updateBookName').value = book.name;
        document.getElementById('updateAuthor').value = book.author;
        document.getElementById('updateSerialNo').value = book.serialNo;
        document.querySelector(`input[name="updateType"][value="${book.type}"]`).checked = true;
    }
});

document.getElementById('updateBookForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const bookId = document.getElementById('updateBookId').value;
    const type = document.querySelector('input[name="updateType"]:checked').value;
    const name = document.getElementById('updateBookName').value;
    const author = document.getElementById('updateAuthor').value;
    const serialNo = document.getElementById('updateSerialNo').value;
    
    if (!bookId || !name || !author || !serialNo) {
        showError('updateBookError', 'All fields are mandatory');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/books/${bookId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ name, author, type, serialNo })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showSuccess('updateBookSuccess', 'Book updated successfully');
            loadBooksForUpdate();
            document.getElementById('updateBookForm').reset();
        } else {
            showError('updateBookError', data.message || 'Failed to update book');
        }
    } catch (error) {
        showError('updateBookError', 'Network error. Please try again.');
    }
});

document.querySelectorAll('input[name="userType"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        const isExisting = e.target.value === 'existing';
        document.getElementById('existingUserSelect').style.display = isExisting ? 'block' : 'none';
        document.getElementById('userPassword').required = !isExisting;
        
        if (isExisting) {
            loadUsersForManagement();
        } else {
            document.getElementById('userManagementForm').reset();
            document.querySelector('input[name="userType"][value="new"]').checked = true;
        }
    });
});

async function loadUsersForManagement() {
    try {
        const response = await fetch(`${API_BASE}/users`, {
            headers: getAuthHeaders()
        });
        
        const users = await response.json();
        const select = document.getElementById('selectUserId');
        select.innerHTML = '<option value="">Select a user</option>';
        
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user._id;
            option.textContent = `${user.name} (${user.username})`;
            option.dataset.user = JSON.stringify(user);
            select.appendChild(option);
        });
    } catch (error) {
        showError('userManagementError', 'Failed to load users');
    }
}

document.getElementById('selectUserId').addEventListener('change', (e) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    if (selectedOption.value) {
        const user = JSON.parse(selectedOption.dataset.user);
        document.getElementById('userName').value = user.name;
        document.getElementById('userUsername').value = user.username;
        document.getElementById('userEmail').value = user.email;
        document.getElementById('userRole').value = user.role;
    }
});

document.getElementById('userManagementForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userType = document.querySelector('input[name="userType"]:checked').value;
    const name = document.getElementById('userName').value;
    const username = document.getElementById('userUsername').value;
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPassword').value;
    const role = document.getElementById('userRole').value;
    const userId = document.getElementById('selectUserId').value;
    
    if (!name) {
        showError('userManagementError', 'Name is mandatory');
        return;
    }
    
    if (userType === 'new') {
        if (!username || !email || !password || !role) {
            showError('userManagementError', 'All fields are mandatory for new user');
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE}/users`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ username, password, role, name, email })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showSuccess('userManagementSuccess', 'User created successfully');
                document.getElementById('userManagementForm').reset();
                document.querySelector('input[name="userType"][value="new"]').checked = true;
                document.getElementById('existingUserSelect').style.display = 'none';
            } else {
                showError('userManagementError', data.message || 'Failed to create user');
            }
        } catch (error) {
            showError('userManagementError', 'Network error. Please try again.');
        }
    } else {
        if (!userId) {
            showError('userManagementError', 'Please select a user');
            return;
        }
        
        try {
            const updateData = { name, username, email, role };
            if (password) updateData.password = password;
            
            const response = await fetch(`${API_BASE}/users/${userId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(updateData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showSuccess('userManagementSuccess', 'User updated successfully');
                loadUsersForManagement();
            } else {
                showError('userManagementError', data.message || 'Failed to update user');
            }
        } catch (error) {
            showError('userManagementError', 'Network error. Please try again.');
        }
    }
});

