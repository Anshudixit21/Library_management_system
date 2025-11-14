function showAddMembership() {
    document.getElementById('addMembershipSection').style.display = 'block';
    document.getElementById('updateMembershipSection').style.display = 'none';
    document.getElementById('addMembershipForm').reset();
    document.querySelector('input[name="addMembershipType"][value="6 months"]').checked = true;
}

function showUpdateMembership() {
    document.getElementById('addMembershipSection').style.display = 'none';
    document.getElementById('updateMembershipSection').style.display = 'block';
    document.getElementById('updateMembershipForm').reset();
    document.querySelector('input[name="updateMembershipType"][value="6 months"]').checked = true;
    document.getElementById('cancelMembership').checked = false;
}

document.getElementById('updateMembershipNumber').addEventListener('blur', async () => {
    const membershipNumber = document.getElementById('updateMembershipNumber').value.trim();
    
    if (!membershipNumber) return;
    
    try {
        const response = await fetch(`${API_BASE}/memberships/${membershipNumber}`, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const membership = await response.json();
            document.getElementById('updateMemberName').value = membership.name;
            document.getElementById('updateMemberEmail').value = membership.email;
            document.getElementById('updateMemberPhone').value = membership.phone;
            document.getElementById('updateMemberAddress').value = membership.address;
        } else {
            showError('updateMembershipError', 'Membership not found');
        }
    } catch (error) {
        showError('updateMembershipError', 'Failed to load membership');
    }
});

document.getElementById('addMembershipForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const membershipNumber = document.getElementById('addMembershipNumber').value.trim();
    const name = document.getElementById('addMemberName').value.trim();
    const email = document.getElementById('addMemberEmail').value.trim();
    const phone = document.getElementById('addMemberPhone').value.trim();
    const address = document.getElementById('addMemberAddress').value.trim();
    const membershipType = document.querySelector('input[name="addMembershipType"]:checked').value;
    
    if (!membershipNumber || !name || !email || !phone || !address || !membershipType) {
        showError('addMembershipError', 'All fields are mandatory');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/memberships`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                membershipNumber,
                name,
                email,
                phone,
                address,
                membershipType
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showSuccess('addMembershipSuccess', 'Membership added successfully');
            document.getElementById('addMembershipForm').reset();
            document.querySelector('input[name="addMembershipType"][value="6 months"]').checked = true;
        } else {
            showError('addMembershipError', data.message || 'Failed to add membership');
        }
    } catch (error) {
        showError('addMembershipError', 'Network error. Please try again.');
    }
});

document.getElementById('updateMembershipForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const membershipNumber = document.getElementById('updateMembershipNumber').value.trim();
    const name = document.getElementById('updateMemberName').value.trim();
    const email = document.getElementById('updateMemberEmail').value.trim();
    const phone = document.getElementById('updateMemberPhone').value.trim();
    const address = document.getElementById('updateMemberAddress').value.trim();
    const membershipType = document.querySelector('input[name="updateMembershipType"]:checked').value;
    const cancelMembership = document.getElementById('cancelMembership').checked;
    
    if (!membershipNumber || !name || !email || !phone || !address) {
        showError('updateMembershipError', 'All fields are mandatory');
        return;
    }
    
    try {
        const updateData = {
            name,
            email,
            phone,
            address,
            isActive: !cancelMembership
        };
        
        if (!cancelMembership) {
            updateData.membershipType = membershipType;
        }
        
        const response = await fetch(`${API_BASE}/memberships/${membershipNumber}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(updateData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showSuccess('updateMembershipSuccess', cancelMembership ? 'Membership cancelled successfully' : 'Membership updated successfully');
            if (cancelMembership) {
                document.getElementById('updateMembershipForm').reset();
                document.querySelector('input[name="updateMembershipType"][value="6 months"]').checked = true;
            }
        } else {
            showError('updateMembershipError', data.message || 'Failed to update membership');
        }
    } catch (error) {
        showError('updateMembershipError', 'Network error. Please try again.');
    }
});

