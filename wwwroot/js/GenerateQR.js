 
    const sampleAttendees = [
    {id: 'A-001', firstName: 'John', lastName: 'Smith', email: 'john.smith@example.com', phone: '(555) 123-4567', company: 'Tech Corp', department: 'Executive', status: 'registered' },
    {id: 'A-002', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.j@example.com', phone: '(555) 987-6543', company: 'Innovate Ltd', department: 'Technology', status: 'checked-in' },
    {id: 'A-003', firstName: 'Michael', lastName: 'Brown', email: 'm.brown@example.com', phone: '(555) 456-7890', company: 'Global Solutions', department: 'Management', status: 'registered' },
    {id: 'A-004', firstName: 'Emily', lastName: 'Davis', email: 'emily.davis@example.com', phone: '(555) 234-5678', company: 'Creative Minds', department: 'Design', status: 'pending' },
    {id: 'A-005', firstName: 'David', lastName: 'Wilson', email: 'd.wilson@example.com', phone: '(555) 345-6789', company: 'Future Tech', department: 'Engineering', status: 'registered' },
    {id: 'A-006', firstName: 'Lisa', lastName: 'Anderson', email: 'l.anderson@example.com', phone: '(555) 567-8901', company: 'Data Systems', department: 'Analytics', status: 'checked-in' },
    {id: 'A-007', firstName: 'Robert', lastName: 'Taylor', email: 'r.taylor@example.com', phone: '(555) 678-9012', company: 'Cloud Solutions', department: 'IT', status: 'registered' },
    {id: 'A-008', firstName: 'Jennifer', lastName: 'Martinez', email: 'j.martinez@example.com', phone: '(555) 789-0123', company: 'Digital Innovations', department: 'Marketing', status: 'pending' }
    ];

    let attendees = JSON.parse(localStorage.getItem('attendees')) || [...sampleAttendees];
    let passesGenerated = parseInt(localStorage.getItem('passesGenerated')) || 0;
    let currentPage = 1;
    const attendeesPerPage = 5;
    let selectedAttendees = new Set();
    let bulkOption = 'selected';


        document.addEventListener('DOMContentLoaded', () => {
        console.log('Page loaded, checking QRCode availability...');

    if (typeof qrcode === 'undefined') {
        console.error('QRCode library not loaded properly');
    const existingScript = document.querySelector('script[src*="qrcode-generator"]');
    if (existingScript) {
        existingScript.remove();
                }
    loadQRCodeWithoutIntegrity();
            } else {
        console.log('QRCode library is available:', typeof qrcode);
            }

    updateDashboard();
    renderAttendeesTable();
    setupEventListeners();
        });

    function loadQRCodeWithoutIntegrity() {
            const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js';
    script.onload = function() {
        console.log('QRCode library loaded without integrity check');
            };
    script.onerror = function() {
        console.error('Failed to load QRCode library even without integrity');
    showNotification('QR Code functionality unavailable. Some features may not work.', 'error');
            };
    document.head.appendChild(script);
        }

    function setupEventListeners() {
        document.getElementById('prevBtn').addEventListener('click', () => changePage(-1));
            document.getElementById('nextBtn').addEventListener('click', () => changePage(1));
    document.getElementById('clearFiltersBtn').addEventListener('click', clearFilters);
    document.getElementById('addAttendeeBtn').addEventListener('click', addAttendee);
    document.getElementById('exportBtn').addEventListener('click', exportList);
    document.getElementById('bulkGenerateBtn').addEventListener('click', showBulkModal);
    document.getElementById('closeModal').addEventListener('click', hideBulkModal);
    document.getElementById('cancelBulk').addEventListener('click', hideBulkModal);
    document.getElementById('generateBulk').addEventListener('click', generateBulkPasses);

            document.querySelectorAll('.bulk-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.bulk-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            bulkOption = option.getAttribute('data-option');
        });
            });

    selectAllCheckbox.addEventListener('change', toggleSelectAll);

    document.getElementById('filterId').addEventListener('input', applyFilters);
    document.getElementById('filterName').addEventListener('input', applyFilters);
    document.getElementById('filterEmail').addEventListener('input', applyFilters);
    document.getElementById('filterCompany').addEventListener('input', applyFilters);
    document.getElementById('filterStatus').addEventListener('change', applyFilters);
        }

    function renderAttendeesTable() {
            const tbody = document.querySelector('#attendeesTable tbody');
    tbody.innerHTML = '';

    const filteredAttendees = filterAttendees();
    const paginatedAttendees = paginateAttendees(filteredAttendees);

    if (paginatedAttendees.length === 0) {
        tbody.innerHTML = `
                    <tr>
                        <td colspan="9" style="text-align: center; padding: 40px; color: var(--gray);">
                            <i class="fas fa-users" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                            No attendees found
                            <p style="margin-top: 10px;">Try adjusting your filters or add new attendees</p>
                        </td>
                    </tr>
                `;
    return;
            }

            paginatedAttendees.forEach(attendee => {
                const statusClass = getStatusClass(attendee.status);
    const isSelected = selectedAttendees.has(attendee.id);
    const tr = document.createElement('tr');
    tr.innerHTML = `
    <td>
        <input type="checkbox" class="attendee-checkbox" data-id="${attendee.id}" ${isSelected ? 'checked' : ''}>
    </td>
    <td>${attendee.id}</td>
    <td>${attendee.firstName} ${attendee.lastName}</td>
    <td>${attendee.email}</td>
    <td>${attendee.phone}</td>
    <td>${attendee.company}</td>
    <td>${attendee.department}</td>
    <td style="display:none;"><span class="${statusClass}">${attendee.status}</span></td>
    <td class="action-buttons">
        <button class="action-btn view-btn" data-id="${attendee.id}" style="display:none;" title="View Details">
            <i class="fas fa-eye"></i>
        </button>
        <button class="action-btn qr-btn" data-id="${attendee.id}" title="Generate QR Pass">
            <i class="fas fa-qrcode"></i>
        </button>
        <button class="action-btn edit-btn" data-id="${attendee.id}" style="display:none;" title="Edit Attendee">
            <i class="fas fa-edit"></i>
        </button>
        <button class="action-btn delete-btn" data-id="${attendee.id}" style="display:none;" title="Delete Attendee">
            <i class="fas fa-trash"></i>
        </button>
    </td>
    `;
    tbody.appendChild(tr);
            });

    const startIndex = (currentPage - 1) * attendeesPerPage + 1;
    const endIndex = Math.min(currentPage * attendeesPerPage, filteredAttendees.length);
    document.getElementById('paginationInfo').textContent =
    `Showing ${startIndex} to ${endIndex} of ${filteredAttendees.length} attendees`;

            document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('button').getAttribute('data-id');
            viewAttendee(id);
        });
            });

            document.querySelectorAll('.qr-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('button').getAttribute('data-id');
            generateQRPass(id);
        });
            });

            document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('button').getAttribute('data-id');
            editAttendee(id);
        });
            });

            document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('button').getAttribute('data-id');
            deleteAttendee(id);
        });
            });

            document.querySelectorAll('.attendee-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const id = e.target.getAttribute('data-id');
            if (e.target.checked) {
                selectedAttendees.add(id);
            } else {
                selectedAttendees.delete(id);
                selectAllCheckbox.checked = false;
            }
        });
            });

    updateSelectAllCheckbox();
        }

    function toggleSelectAll() {
            const filteredAttendees = filterAttendees();
    const paginatedAttendees = paginateAttendees(filteredAttendees);

    if (selectAllCheckbox.checked) {
        paginatedAttendees.forEach(attendee => {
            selectedAttendees.add(attendee.id);
        });
            } else {
        paginatedAttendees.forEach(attendee => {
            selectedAttendees.delete(attendee.id);
        });
            }

    renderAttendeesTable();
        }

    function updateSelectAllCheckbox() {
            const filteredAttendees = filterAttendees();
    const paginatedAttendees = paginateAttendees(filteredAttendees);

            const allSelected = paginatedAttendees.every(attendee =>
    selectedAttendees.has(attendee.id)
    );

    selectAllCheckbox.checked = allSelected;
    selectAllCheckbox.indeterminate = !allSelected &&
                paginatedAttendees.some(attendee => selectedAttendees.has(attendee.id));
        }

    function showBulkModal() {
        bulkModal.classList.add('show');
        }

    function hideBulkModal() {
        bulkModal.classList.remove('show');
        }

function generateBulkPasses() {
    let attendeesToGenerate = [];

    switch (bulkOption) {
        case 'selected':
            attendeesToGenerate = attendees.filter(a => selectedAttendees.has(a.id));
            break;
        case 'filtered':
            attendeesToGenerate = filterAttendees();
            break;
        case 'all':
            attendeesToGenerate = [...attendees];
            break;
    }

    if (attendeesToGenerate.length === 0) {
        showNotification('No attendees selected for bulk generation', 'warning');
        return;
    }

    hideBulkModal();

    // Generate passes in bulk
    const passWindow = window.open('', '_blank');

    let htmlContent = '<!DOCTYPE html>';
    htmlContent += '<html lang="en">';
    htmlContent += '<head>';
    htmlContent += '<meta charset="UTF-8">';
    htmlContent += '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
    htmlContent += '<title>Bulk Passes - 19th India Rendezvous 2026</title>';
    htmlContent += '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">';
    htmlContent += '<style>';
    htmlContent += '@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");';
    htmlContent += '* {margin: 0; padding: 0; box-sizing: border-box; }';
    htmlContent += 'body { background: white; padding: 20px; font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }';
    htmlContent += '.passes-container { display: flex; flex-wrap: wrap; gap: 15px; justify-content: center; align-items: flex-start; }';
    htmlContent += '.pass-card {width: 85mm;height: 54mm; background: white;border-radius: 8px;box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);overflow: hidden;position: relative;border: 2px solid #1a237e;-webkit-print-color-adjust: exact !important;print-color-adjust: exact !important;color-adjust: exact !important;display: flex;}';
    htmlContent += '.accent-bar {position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%); }';
    htmlContent += '.left-section {width: 58%; background: linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%); padding: 16px; color: white; display: flex; flex-direction: column; position: relative; overflow: hidden; }';
    htmlContent += '.left-section::before {content: ""; position: absolute; width: 300px; height: 300px; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%); top: -100px; right: -100px; border-radius: 50%; }';
    htmlContent += '.left-section::after {content: ""; position: absolute; width: 200px; height: 200px; background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%); bottom: -80px; left: -80px; border-radius: 50%; }';
    htmlContent += '.right-section {width: 42%; background: #fafafa; padding: 16px 12px; display: flex; flex-direction: column; justify-content: space-between; align-items: center; position: relative;}';
    htmlContent += '.logo-container {margin-bottom: 12px; z-index: 1; }';
    htmlContent += '.event-logo {height: 32px; padding: 6px 12px; background: rgba(255, 255, 255, 0.95); border-radius: 8px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); backdrop-filter: blur(10px); }';
    htmlContent += '.event-logo img {height: 100%; width: auto; object-fit: contain; }';
    htmlContent += '.event-header {margin-bottom: 14px; z-index: 1; }';
    htmlContent += '.event-name {font-size: 0.65rem;font-weight: 700;color: white;line-height: 1.1;margin-bottom: 2px; padding-top: 20px; }';
    htmlContent += '.event-tagline {font-size: 0.5rem;color: #e3f2fd;line-height: 1.1;}';
    htmlContent += '.attendee-section {flex: 1; display: flex; flex-direction: column; justify-content: center; z-index: 1; }';
    htmlContent += '.attendee-name {font-size: 0.8rem;font-weight: 700;color: white;margin-bottom: 4px;line-height: 1.1; }';
    htmlContent += '.info-row {font-size: 0.55rem;color: #e3f2fd;margin-bottom: 2px;line-height: 1.1; }';
    htmlContent += '.info-text {font-size: 0.55rem; color: rgba(255, 255, 255, 0.9); line-height: 1.3; font-weight: 500; }';
    htmlContent += '.id-badge {background: rgba(255, 255, 255, 0.2);color: white; padding: 2px 6px;border-radius: 8px;font-size: 0.5rem;font-weight: 600;margin-top: 4px;display: inline-block; }';
    htmlContent += '.qr-wrapper {text-align: center; margin-bottom: 6px; }';
    htmlContent += '.qr-box {width: 88px; height: 88px; background: white; padding: 6px; border-radius: 12px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12); border: 2px solid #e0e0e0; position: relative; overflow: hidden; }';
    htmlContent += '.qr-box::before {content: ""; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%); }';
    htmlContent += '.qr-code {width: 100%; height: 100%; position: relative; z-index: 1; }';
    htmlContent += '.scan-label {margin-top: 8px; font-size: 0.5rem; font-weight: 700; color: #1a237e; text-transform: uppercase; letter-spacing: 0.08em; text-align: center; }';
    htmlContent += '.event-info-box {padding-bottom:7px;}';
    htmlContent += '.event-date {background: #1a237e;color: white;padding: 3px 6px;border-radius: 6px;font-size: 0.5rem;font-weight: 600;text-align: center;margin-top: 4px;}';
    htmlContent += '.event-location {text-align: center;padding-top: 4px;border-top: 1px solid #eee}';
    htmlContent += '.footer-badge {margin-top: 8px; font-size: 0.42rem; color: #9e9e9e; text-align: center; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }';
    htmlContent += '.print-btn {position: fixed; top: 20px; right: 20px; background: white; border: none; color: #1a237e; padding: 12px 24px; border-radius: 50px; font-size: 0.85rem; font-weight: 600; cursor: pointer; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15); transition: all 0.3s ease; display: flex; align-items: center; gap: 8px; z-index: 1000; font-family: "Inter", sans-serif; }';
    htmlContent += '.print-btn:hover {transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2); background: #f5f5f5; }';
    htmlContent += '.print-btn svg {width: 18px; height: 18px; }';
    htmlContent += '@media print {';
    htmlContent += '@page {margin: 10mm; size: auto; }';
    htmlContent += 'body {background: white !important; padding: 0 !important; margin: 0 !important; }';
    htmlContent += '.pass-card {box-shadow: none !important; margin: 0 !important; break-inside: avoid; page-break-inside: avoid; margin-bottom: 5mm !important; }';
    htmlContent += '.print-btn {display: none !important; }';
    htmlContent += '.left-section, .event-info-box {-webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }';
    htmlContent += '.passes-container {display: block; }';
    htmlContent += '}';
    htmlContent += '</style>';
    htmlContent += '</head>';
    htmlContent += '<body>';
    htmlContent += '<button class="print-btn" onclick="window.print()">';
    htmlContent += '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>';
    htmlContent += 'Print All Passes';
    htmlContent += '</button>';
    htmlContent += '<div class="passes-container">';

    // Generate QR codes and passes for each attendee
    attendeesToGenerate.forEach((attendee, index) => {
        try {
            const qrData = JSON.stringify({
                id: attendee.id
            });

            const qr = qrcode(0, 'M');
            qr.addData(qrData);
            qr.make();

            const qrImageData = qr.createDataURL(4);
            const qrContent = '<img src="' + qrImageData + '" alt="QR Code" style="width: 100%; height: 100%;">';

            htmlContent += '<div class="pass-card">';
            htmlContent += '<div class="accent-bar"></div>';
            htmlContent += '<div class="left-section">';
            htmlContent += '<div class="logo-container">';
            htmlContent += '<div class="event-logo">';
            htmlContent += '<img src="https://www.asiainsurancereview.com/Portals/0/air.svg" alt="AIR Logo" onerror="this.style.display=\'none\'">';
            htmlContent += '</div>';
            htmlContent += '</div>';
            htmlContent += '<div class="event-header">';
            htmlContent += '<div class="event-name">19th India Rendezvous 2026</div>';
            htmlContent += '<div class="event-tagline">Asia Insurance Review</div>';
            htmlContent += '</div>';
            htmlContent += '<div class="attendee-section">';
            htmlContent += '<div class="attendee-name">' + attendee.firstName + ' ' + attendee.lastName + '</div>';
            htmlContent += '<div class="info-row">';
            htmlContent += '<div class="info-text">' + attendee.company + '</div>';
            htmlContent += '</div>';
            htmlContent += '<div class="info-row">';
            htmlContent += '<div class="info-text">' + attendee.department + '</div>';
            htmlContent += '</div>';
            htmlContent += '<div class="info-row">';
            htmlContent += '<div class="info-text">' + attendee.email + '</div>';
            htmlContent += '</div>';
            htmlContent += '<div class="id-badge">ID: ' + attendee.id + '</div>';
            htmlContent += '</div>';
            htmlContent += '</div>';
            htmlContent += '<div class="right-section">';
            htmlContent += '<div class="qr-wrapper">';
            htmlContent += '<div class="qr-box">';
            htmlContent += '<div class="qr-code">' + qrContent + '</div>';
            htmlContent += '</div>';
            htmlContent += '<div class="scan-label">Scan to Check-In</div>';
            htmlContent += '</div>';
            htmlContent += '<div style="width: 100%;">';
            htmlContent += '<div class="event-info-box">';
            htmlContent += '<div class="event-date">19-21 JAN 2026</div>';
            htmlContent += '</div>';
            htmlContent += '<div class="footer-badge">Official Event Pass <div class="event-location">JW Marriott Mumbai Juhu, Mumbai, India</div></div>';
            htmlContent += '</div>';
            htmlContent += '</div>';
            htmlContent += '</div>';

            // Update passes generated count
            passesGenerated++;
        } catch (error) {
            console.error(`Error generating QR for ${attendee.id}:`, error);
        }
    });

    htmlContent += '</div>';
    htmlContent += '<script>';
    htmlContent += 'window.onload = function() {';
    htmlContent += 'setTimeout(() => {';
    htmlContent += 'document.querySelectorAll("*").forEach(el => {';
    htmlContent += 'el.style.webkitPrintColorAdjust = "exact";';
    htmlContent += 'el.style.printColorAdjust = "exact";';
    htmlContent += 'el.style.colorAdjust = "exact";';
    htmlContent += '});';
    htmlContent += '}, 100);';
    htmlContent += '};';
    htmlContent += '</scr' + 'ipt>';
    htmlContent += '</body>';
    htmlContent += '</html>';

    passWindow.document.write(htmlContent);
    passWindow.document.close();

    // Save updated count
    localStorage.setItem('passesGenerated', passesGenerated);
    updateDashboard();

    showNotification(`Generated ${attendeesToGenerate.length} passes successfully`);
}
    //function generateBulkPasses() {
    //    let attendeesToGenerate = [];

    //switch (bulkOption) {
    //            case 'selected':
    //                attendeesToGenerate = attendees.filter(a => selectedAttendees.has(a.id));
    //break;
    //case 'filtered':
    //attendeesToGenerate = filterAttendees();
    //break;
    //case 'all':
    //attendeesToGenerate = [...attendees];
    //break;
    //        }

    //if (attendeesToGenerate.length === 0) {
    //    showNotification('No attendees selected for bulk generation', 'warning');
    //return;
    //        }

    //hideBulkModal();

    //const passWindow = window.open('', '_blank');

    //let passesHTML = '<!DOCTYPE html>';
    //passesHTML += '<html lang="en">';
    //    passesHTML += '<head>';
    //        passesHTML += '<meta charset="UTF-8">';
    //            passesHTML += '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
    //                passesHTML += '<title>Bulk Passes - 19th India Rendezvous 2026</title>';
    //                passesHTML += '<style>';
    //                    passesHTML += '* {margin: 0; event-info-box: 0; box-sizing: border-box; font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; }';
    //                    passesHTML += 'body {background: white; padding: 10px; }';
    //                    passesHTML += '.passes-container {display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }';
    //                    passesHTML += '.pass-card {width: 300px; height: 120px; background: linear-gradient(135deg, #1a237e, #283593); border-radius: 8px; padding: 12px; color: white; display: flex; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2); position: relative; overflow: hidden; }';
    //                    passesHTML += '.pass-content {flex: 1; display: flex; flex-direction: column; justify-content: space-between; }';
    //                    passesHTML += '.event-header {display: flex; align-items: center; gap: 8px; margin-bottom: 5px; }';
    //                    passesHTML += '.event-logo {width: 170px; height: 35px; background: white; border-radius: 4px; display: flex; align-items: center; justify-content: center; }';
    //                    passesHTML += '.event-logo img {max - width: 20px; max-height: 20px; }';
    //                    passesHTML += '.event-title {font - size: 0.7rem; font-weight: 600; line-height: 1.2; }';
    //                    passesHTML += '.event-details {font - size: 0.55rem; opacity: 0.9; line-height: 1.2; }';
    //                    passesHTML += '.attendee-info {margin - top: 5px; }';
    //                    passesHTML += '.attendee-name {font - size: 0.8rem; font-weight: 600; margin-bottom: 2px; }';
    //                    passesHTML += '.attendee-details {font - size: 0.6rem; opacity: 0.9; margin-bottom: 1px; }';
    //                    passesHTML += '.attendee-id {font - size: 0.55rem; background: rgba(255, 255, 255, 0.2); padding: 2px 6px; border-radius: 10px; display: inline-block; margin-top: 3px; }';
    //                    passesHTML += '.qr-section {width: 70px; display: flex; align-items: center; justify-content: center; background: white; border-radius: 4px; padding: 5px; }';
    //                    passesHTML += '.qr-code svg {width: 60px !important; height: 60px !important; }';
    //                    passesHTML += '.watermark {position: absolute; bottom: 5px; right: 8px; font-size: 0.5rem; opacity: 0.7; }';
    //                    passesHTML += '@media print {';
    //        passesHTML += 'body {padding: 0; }';
    //                    passesHTML += '.pass-card { break-inside: avoid; margin-bottom: 5px; }';
    //        passesHTML += '}';
    //                    passesHTML += '</style>';
    //                passesHTML += '</head>';
    //            passesHTML += '<body>';
    //                passesHTML += '<div class="passes-container">';

    //        attendeesToGenerate.forEach((attendee, index) => {
    //            try {
    //                const qrData = JSON.stringify({
    //                        id: attendee.id
    //                });

    //                    const qr = qrcode(4, 'M');
    //                    qr.addData(qrData);
    //                    qr.make();
    //                    const qrSvg = qr.createSvgTag(2);

    //                    passesHTML += '<div class="pass-card">';
    //                        passesHTML += '<div class="pass-content">';
    //                            passesHTML += '<div>';
    //                                passesHTML += '<div class="event-header">';
    //                                    passesHTML += '<div class="event-logo">';
    //                                        passesHTML += '<img src="https://www.asiainsurancereview.com/Portals/0/air.svg" alt="AIR Logo">';
    //                                            passesHTML += '</div>';
    //                                    passesHTML += '<div>';
    //                                        passesHTML += '<div class="event-title">19th India Rendezvous 2026</div>';
    //                                        passesHTML += '<div class="event-details">19-21 Jan 2026 • JW Marriott Mumbai</div>';
    //                                        passesHTML += '</div>';
    //                                    passesHTML += '</div>';
    //                                passesHTML += '<div class="attendee-info">';
    //                                    passesHTML += '<div class="attendee-name">' + attendee.firstName + ' ' + attendee.lastName + '</div>';
    //                                    passesHTML += '<div class="attendee-details">' + attendee.company + '</div>';
    //                                    passesHTML += '<div class="attendee-details">' + attendee.department + '</div>';
    //                                    passesHTML += '<div class="attendee-id">' + attendee.id + '</div>';
    //                                    passesHTML += '</div>';
    //                                passesHTML += '</div>';
    //                            passesHTML += '<div class="watermark">AIR Event Pass</div>';
    //                            passesHTML += '</div>';
    //                        passesHTML += '<div class="qr-section">';
    //                            passesHTML += '<div class="qr-code">';
    //                                passesHTML += qrSvg;
    //                                passesHTML += '</div>';
    //                            passesHTML += '</div>';
    //                        passesHTML += '</div>';

    //                    passesGenerated++;
    //            } catch (error) {
    //                        console.error('Error generating QR for ' + attendee.id + ':', error);
    //            }
    //        });

    //                    passesHTML += '</div>';
    //                passesHTML += '<script>';
    //                    passesHTML += 'window.onload = function() {';
    //        passesHTML += 'window.print();';
    //        passesHTML += '};';
    //                    passesHTML += '</scr' + 'ipt>';
    //                passesHTML += '</body>';
    //            passesHTML += '</html>';

    //        passWindow.document.write(passesHTML);
    //        passWindow.document.close();

    //        localStorage.setItem('passesGenerated', passesGenerated);
    //        updateDashboard();

    //        showNotification('Generated ' + attendeesToGenerate.length + ' passes successfully');
    //    }

            function getStatusClass(status) {
            switch(status) {
                case 'registered':
            return 'status-registered';
            case 'checked-in':
            return 'status-checked-in';
            case 'pending':
            return 'status-pending';
            default:
            return '';
            }
        }

            function filterAttendees() {
            const idFilter = document.getElementById('filterId').value.toLowerCase();
            const nameFilter = document.getElementById('filterName').value.toLowerCase();
            const emailFilter = document.getElementById('filterEmail').value.toLowerCase();
            const companyFilter = document.getElementById('filterCompany').value.toLowerCase();
            const statusFilter = document.getElementById('filterStatus').value;

            return attendees.filter(attendee => {
                const fullName = `${attendee.firstName} ${attendee.lastName}`.toLowerCase();

            return (!idFilter || attendee.id.toLowerCase().includes(idFilter)) &&
            (!nameFilter || fullName.includes(nameFilter)) &&
            (!emailFilter || attendee.email.toLowerCase().includes(emailFilter)) &&
            (!companyFilter || attendee.company.toLowerCase().includes(companyFilter)) &&
            (!statusFilter || attendee.status === statusFilter);
            });
        }

            function paginateAttendees(attendeesList) {
            const startIndex = (currentPage - 1) * attendeesPerPage;
            return attendeesList.slice(startIndex, startIndex + attendeesPerPage);
        }

            function changePage(direction) {
            const filteredAttendees = filterAttendees();
            const totalPages = Math.ceil(filteredAttendees.length / attendeesPerPage);

            currentPage += direction;
            if (currentPage < 1) currentPage = 1;
            if (currentPage > totalPages) currentPage = totalPages;

            renderAttendeesTable();
        }

            function applyFilters() {
                currentPage = 1;
            renderAttendeesTable();
        }

            function clearFilters() {
                document.getElementById('filterId').value = '';
            document.getElementById('filterName').value = '';
            document.getElementById('filterEmail').value = '';
            document.getElementById('filterCompany').value = '';
            document.getElementById('filterStatus').value = '';

            applyFilters();
        }

            function updateDashboard() {
                document.getElementById('totalAttendees').textContent = attendees.length;
            document.getElementById('passesGenerated').textContent = passesGenerated;
        }

            function viewAttendee(id) {
            const attendee = attendees.find(a => a.id === id);
            if (!attendee) return;

            showNotification(`Viewing details for ${attendee.firstName} ${attendee.lastName}`, 'warning');
        }

            function generateQRPass(id) {
            const attendee = attendees.find(a => a.id === id);
            if (!attendee) return;

            if (typeof qrcode === 'undefined') {
                showNotification('QR Code functionality is currently unavailable. Please refresh the page and try again.', 'error');
            return;
            }

            passesGenerated++;
            localStorage.setItem('passesGenerated', passesGenerated);
            updateDashboard();

            const qrData = JSON.stringify({
                id: attendee.id
            });

            try {
                const qr = qrcode(0, 'M');
            qr.addData(qrData);
            qr.make();

            const qrImageData = qr.createDataURL(4);
            const qrContent = '<img src="' + qrImageData + '" alt="QR Code" style="width: 100%; height: 100%;">';

                const passWindow = window.open('', '_blank');

                let htmlContent = '<!DOCTYPE html>';
                htmlContent += '<html lang="en">';
                    htmlContent += '<head>';
                        htmlContent += '<meta charset="UTF-8">';
                            htmlContent += '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
                                htmlContent += '<title>Event Pass - ' + attendee.firstName + ' ' + attendee.lastName + '</title>';
                                htmlContent += '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">';
                                    htmlContent += '<style>';
                                        htmlContent += '@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");';
                                        htmlContent += '* {margin: 0; padding: 0; box-sizing: border-box; }';
                                        htmlContent += 'body { display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }';
                                      //  htmlContent += '.pass-card {width: 90mm; height: 56mm; background: white; border-radius: 16px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1); overflow: hidden; position: relative; display: flex; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }';

                htmlContent += '.pass-card {width: 85mm;height: 54mm; background: white;border-radius: 8px;box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);overflow: hidden;position: relative;border: 2px solid #1a237e;-webkit-print-color-adjust: exact !important;print-color-adjust: exact !important;color-adjust: exact !important;display: flex;}';

                htmlContent += '.accent-bar {position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%); }';
                                        htmlContent += '.left-section {width: 58%; background: linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%); padding: 16px; color: white; display: flex; flex-direction: column; position: relative; overflow: hidden; }';
                                        htmlContent += '.left-section::before {content: ""; position: absolute; width: 300px; height: 300px; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%); top: -100px; right: -100px; border-radius: 50%; }';
                                        htmlContent += '.left-section::after {content: ""; position: absolute; width: 200px; height: 200px; background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%); bottom: -80px; left: -80px; border-radius: 50%; }';
                                        htmlContent += '.right-section {width: 42%; background: #fafafa; padding: 16px 12px; display: flex; flex-direction: column; justify-content: space-between; align-items: center; position: relative;}';
                                        htmlContent += '.logo-container {margin - bottom: 12px; z-index: 1; }';
                                        htmlContent += '.event-logo {height: 32px; padding: 6px 12px; background: rgba(255, 255, 255, 0.95); border-radius: 8px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); backdrop-filter: blur(10px); }';
                                        htmlContent += '.event-logo img {height: 100%; width: auto; object-fit: contain; }';
                                        htmlContent += '.event-header {margin - bottom: 14px; z-index: 1; }';
                                       // htmlContent += '.event-name {font - size: 0.85rem; font-weight: 800; color: white; line-height: 1.2; letter-spacing: -0.02em; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); margin-bottom: 4px; }';
               
                htmlContent += '.event-name {font-size: 0.65rem;font-weight: 700;color: white;line-height: 1.1;margin-bottom: 2px; padding-top: 20px; }';

                                       // htmlContent += '.event-tagline {font - size: 0.5rem; color: rgba(255, 255, 255, 0.85); font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }';
                htmlContent += '.event-tagline {font-size: 0.5rem;color: #e3f2fd;line-height: 1.1;}';

                htmlContent += '.attendee-section {flex: 1; display: flex; flex-direction: column; justify-content: center; z-index: 1; }';
                                      //  htmlContent += '.attendee-name {font - size: 0.95rem; font-weight: 700; color: white; margin-bottom: 8px; line-height: 1.2; letter-spacing: -0.01em; }';
                htmlContent += '.attendee-name {font-size: 0.8rem;font-weight: 700;color: white;margin-bottom: 4px;line-height: 1.1; }';


//                htmlContent += '.info-row {display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }';
                htmlContent += '.info-row {font-size: 0.55rem;color: #e3f2fd;margin-bottom: 2px;line-height: 1.1; }';
                                        htmlContent += '.info-icon {width: 14px; height: 14px; background: rgba(255, 255, 255, 0.2); border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 0.5rem; flex-shrink: 0; }';

                htmlContent += '.info-text {font - size: 0.55rem; color: rgba(255, 255, 255, 0.9); line-height: 1.3; font-weight: 500; }';
                             //           htmlContent += '.id-badge {display: inline-block; margin-top: 8px; background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(10px); color: white; padding: 4px 10px; border-radius: 20px; font-size: 0.5rem; font-weight: 600; letter-spacing: 0.03em; border: 1px solid rgba(255, 255, 255, 0.2); }';
                htmlContent += '.id-badge {background: rgba(255, 255, 255, 0.2);color: white; padding: 2px 6px;border-radius: 8px;font-size: 0.5rem;font-weight: 600;margin-top: 4px;display: inline-block; }';


              //  htmlContent += '.qr-wrapper {flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; }';
                htmlContent += '.qr-wrapper {text-align: center; margin-bottom: 6px; }';

                htmlContent += '.qr-box {width: 88px; height: 88px; background: white; padding: 6px; border-radius: 12px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12); border: 2px solid #e0e0e0; position: relative; overflow: hidden; }';
                                        htmlContent += '.qr-box::before {content: ""; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%); }';
                                        htmlContent += '.qr-code {width: 100%; height: 100%; position: relative; z-index: 1; }';
                                        htmlContent += '.scan-label {margin - top: 8px; font-size: 0.5rem; font-weight: 700; color: #1a237e; text-transform: uppercase; letter-spacing: 0.08em; text-align: center; }';
                                        //htmlContent += '.event-info-box {width: 100%; background: linear-gradient(135deg, #1a237e 0%, #283593 100%); padding: 8px 10px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }';
                //  htmlContent += '.event-date {font - size: 0.65rem; font-weight: 700; color: white; text-align: center; margin-bottom: 3px; letter-spacing: 0.02em; }';
                htmlContent += '.event-info-box {padding-bottom:7px;}';

                htmlContent += '.event-date {background: #1a237e;color: white;padding: 3px 6px;border-radius: 6px;font-size: 0.5rem;font-weight: 600;text-align: center;margin-top: 4px;}';
                                        //htmlContent += '.event-location {font - size: 0.45rem; color: rgba(255, 255, 255, 0.85); text-align: center; font-weight: 500; line-height: 1.3; }';
                htmlContent += '.event-location {text-align: center;padding-top: 4px;border-top: 1px solid #eee}';

                htmlContent += '.footer-badge {margin - top: 8px; font-size: 0.42rem; color: #9e9e9e; text-align: center; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }';
                                        htmlContent += '.print-btn {position: fixed; top: 20px; right: 20px; background: white; border: none; color: #1a237e; padding: 12px 24px; border-radius: 50px; font-size: 0.85rem; font-weight: 600; cursor: pointer; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15); transition: all 0.3s ease; display: flex; align-items: center; gap: 8px; z-index: 1000; font-family: "Inter", sans-serif; }';
                                        htmlContent += '.print-btn:hover {transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2); background: #f5f5f5; }';
                                        htmlContent += '.print-btn svg {width: 18px; height: 18px; }';
                                        htmlContent += '@media print {';
                htmlContent += '@page {margin: 0; size: 90mm 56mm; }';
                                        htmlContent += 'body {background: white !important; padding: 0 !important; margin: 0 !important; }';
                                        htmlContent += '.pass-card {box - shadow: none !important; margin: 0 !important; }';
                                        htmlContent += '.print-btn {display: none !important; }';
                                        htmlContent += '.left-section, .event-info-box {-webkit - print - color - adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }';
                htmlContent += '}';
                                        htmlContent += '</style>';
                                    htmlContent += '</head>';
                                htmlContent += '<body>';
                                    htmlContent += '<button class="print-btn" onclick="window.print()">';
                                        htmlContent += '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>';
                                        htmlContent += 'Print Pass';
                                        htmlContent += '</button>';
                                    htmlContent += '<div class="pass-card">';
                                        htmlContent += '<div class="accent-bar"></div>';
                                        htmlContent += '<div class="left-section">';
                                            htmlContent += '<div class="logo-container">';
                                                htmlContent += '<div class="event-logo">';
                                                    htmlContent += '<img src="https://www.asiainsurancereview.com/Portals/0/air.svg" alt="AIR Logo" onerror="this.style.display=\'none\'">';
                                                        htmlContent += '</div>';
                                                htmlContent += '</div>';
                                            htmlContent += '<div class="event-header">';
                                                htmlContent += '<div class="event-name">19th India Rendezvous 2026</div>';
                                                htmlContent += '<div class="event-tagline">Asia Insurance Review</div>';
                                                htmlContent += '</div>';
                                            htmlContent += '<div class="attendee-section">';
                                                htmlContent += '<div class="attendee-name">' + attendee.firstName + ' ' + attendee.lastName + '</div>';
                                                htmlContent += '<div class="info-row">';
                                                   // htmlContent += '<div class="info-icon">🏢</div>';
                                                    htmlContent += '<div class="info-text">' + attendee.company + '</div>';
                                                    htmlContent += '</div>';
                                                htmlContent += '<div class="info-row">';
                                                   // htmlContent += '<div class="info-icon">💼</div>';
                                                    htmlContent += '<div class="info-text">' + attendee.department + '</div>';
                                                    htmlContent += '</div>';
                                                htmlContent += '<div class="info-row">';
                                                   // htmlContent += '<div class="info-icon">✉️</div>';
                                                    htmlContent += '<div class="info-text">' + attendee.email + '</div>';
                                                    htmlContent += '</div>';
                                                htmlContent += '<div class="id-badge">ID: ' + attendee.id + '</div>';
                                                htmlContent += '</div>';
                                            htmlContent += '</div>';
                                        htmlContent += '<div class="right-section">';
                                            htmlContent += '<div class="qr-wrapper">';
                                                htmlContent += '<div class="qr-box">';
                                                    htmlContent += '<div class="qr-code">' + qrContent + '</div>';
                                                    htmlContent += '</div>';
                                                htmlContent += '<div class="scan-label">Scan to Check-In</div>';
                                                htmlContent += '</div>';
                                            htmlContent += '<div style="width: 100%;">';
                                                htmlContent += '<div class="event-info-box">';
                                                    htmlContent += '<div class="event-date">19-21 JAN 2026</div>';
                                        //htmlContent += '<div class="event-location">JW Marriott Mumbai Juhu, Mumbai, India</div>';
                                                    htmlContent += '</div>';
                htmlContent += '<div class="footer-badge">Official Event Pass <div class="event-location">JW Marriott Mumbai Juhu, Mumbai, India</div></div>';
                                                htmlContent += '</div>';
                                            htmlContent += '</div>';
                                        htmlContent += '</div>';
                                    htmlContent += '<script>';
                                        htmlContent += 'window.onload = function() {';
                htmlContent += 'setTimeout(() => {';
                htmlContent += 'document.querySelectorAll("*").forEach(el => {';
                htmlContent += 'el.style.webkitPrintColorAdjust = "exact";';
                                        htmlContent += 'el.style.printColorAdjust = "exact";';
                                        htmlContent += 'el.style.colorAdjust = "exact";';
                htmlContent += '});';
                htmlContent += '}, 100);';
                htmlContent += '};';
                                        htmlContent += '</scr' + 'ipt>';
                                    htmlContent += '</body>';
                                htmlContent += '</html>';

                            passWindow.document.write(htmlContent);
                            passWindow.document.close();

                            showNotification('QR pass generated for ' + attendee.firstName + ' ' + attendee.lastName);
            } catch (error) {
                                console.error('QR Code generation error:', error);
                            showNotification('Error generating QR code. Please try again.', 'error');
            }
        }

                            function editAttendee(id) {
            const attendee = attendees.find(a => a.id === id);
                            if (!attendee) return;

                            showNotification(`Editing ${attendee.firstName} ${attendee.lastName}`, 'warning');
        }

                            function deleteAttendee(id) {
            const attendee = attendees.find(a => a.id === id);
                            if (!attendee) return;

                            if (confirm(`Are you sure you want to delete ${attendee.firstName} ${attendee.lastName}?`)) {
                                attendees = attendees.filter(a => a.id !== id);
                            selectedAttendees.delete(id);
                            saveData();
                            updateDashboard();
                            renderAttendeesTable();
                            showNotification('Attendee deleted successfully');
            }
        }

                            function addAttendee() {
                                showNotification('Add attendee functionality would open a form', 'warning');
        }

                            function exportList() {
                                showNotification('Export functionality would download a file', 'warning');
        }

                            function saveData() {
                                localStorage.setItem('attendees', JSON.stringify(attendees));
        }

                            function showNotification(message, type = 'success') {
                                notificationText.textContent = message;
                            notification.className = 'notification';
                            notification.classList.add(type);
                            notification.classList.add('show');

            setTimeout(() => {
                                notification.classList.remove('show');
            }, 3000);
        }