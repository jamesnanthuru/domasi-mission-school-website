// ============================================================
// 1. NEWS CAROUSEL
// ============================================================
let currentSlide = 0;
const slides = document.querySelectorAll('.news-slide');
const totalSlides = slides.length;
const dotsContainer = document.getElementById('carouselDots');

// Only run carousel if elements exist
if (slides.length > 0 && dotsContainer) {
    // Create dots
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('span');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dot.onclick = () => goToSlide(i);
        dotsContainer.appendChild(dot);
    }

    function updateCarousel() {
        const carousel = document.getElementById('newsCarousel');
        if (carousel) {
            carousel.style.transform = `translateX(-${currentSlide * 100}%)`;
        }
        
        // Update dots
        document.querySelectorAll('.dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateCarousel();
        resetAutoSlide();
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        updateCarousel();
        resetAutoSlide();
    }

    function goToSlide(index) {
        currentSlide = index;
        updateCarousel();
        resetAutoSlide();
    }

    // Auto-slide every 5 seconds
    let autoSlideInterval = setInterval(nextSlide, 5000);

    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        autoSlideInterval = setInterval(nextSlide, 5000);
    }

    // Pause on hover
    const carouselContainer = document.querySelector('.news-carousel-container');
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', () => {
            clearInterval(autoSlideInterval);
        });
        carouselContainer.addEventListener('mouseleave', () => {
            autoSlideInterval = setInterval(nextSlide, 5000);
        });
    }

    // Expose functions globally so onclick attributes work
    window.nextSlide = nextSlide;
    window.prevSlide = prevSlide;
    window.goToSlide = goToSlide;
}

// ============================================================
// 2. ANIMATED COUNTERS
// ============================================================
function animateCounters() {
    const statItems = document.querySelectorAll('.stat-item');
    
    statItems.forEach(item => {
        const target = parseInt(item.getAttribute('data-count'));
        const numberElement = item.querySelector('.stat-number');
        if (!numberElement) return;
        
        let current = 0;
        const increment = target / 60;
        const duration = 2000;
        const stepTime = duration / 60;
        
        const counter = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(counter);
            }
            numberElement.textContent = Math.floor(current) + (target > 100 ? '+' : '');
        }, stepTime);
    });
}

// ============================================================
// 3. FADE-IN ON SCROLL (Intersection Observer)
// ============================================================
const fadeElements = document.querySelectorAll('.fade-in');

if (fadeElements.length > 0) {
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.2 });

    fadeElements.forEach(el => fadeObserver.observe(el));
}

// ============================================================
// 4. BACK TO TOP BUTTON
// ============================================================
const backToTopBtn = document.getElementById('backToTop');

if (backToTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Expose function globally
    window.scrollToTop = scrollToTop;
}

// ============================================================
// 5. TRIGGER COUNTERS ON SCROLL
// ============================================================
const statsSection = document.getElementById('stats-section');

if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    statsObserver.observe(statsSection);
}

// ============================================================
// 6. SMOOTH SCROLL FOR NAVIGATION ANCHOR LINKS
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

// ============================================================
// 7. BUTTON ARROW HOVER EFFECT (Optional enhancement)
// ============================================================
document.querySelectorAll('.btn i.fa-arrow-right').forEach(icon => {
    icon.style.transition = 'transform 0.3s ease';
    icon.closest('.btn').addEventListener('mouseenter', function() {
        icon.style.transform = 'translateX(5px)';
    });
    icon.closest('.btn').addEventListener('mouseleave', function() {
        icon.style.transform = 'translateX(0)';
    });
});

// ============================================================
// 8. RESULTS PAGE FUNCTIONALITY (COMPLETE)
// ============================================================

// Only run this code if we're on the results page
if (document.getElementById('studentId') && document.getElementById('pin')) {
    
    // --- PIN Input Validation ---
    const pinInput = document.getElementById('pin');
    pinInput.addEventListener('input', function(e) {
        // Remove any non‑digit characters
        this.value = this.value.replace(/\D/g, '');
        // Trim to max length 4
        if (this.value.length > 4) {
            this.value = this.value.slice(0, 4);
        }
    });

    // Enable Enter key to trigger search on either input
    document.getElementById('studentId').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('pin').focus();
        }
    });
    document.getElementById('pin').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkResult();
        }
    });

    // Rate limiting: track failed attempts per session
    let failedAttempts = 0;
    const MAX_ATTEMPTS = 5;
    let lockoutTime = 0;

    // Expose checkResult globally so onclick attribute works
    window.checkResult = function() {
        const studentId = document.getElementById('studentId').value.trim().toUpperCase();
        const pin = document.getElementById('pin').value.trim();
        const resultDisplay = document.getElementById('resultDisplay');
        const loadingSpinner = document.getElementById('loadingSpinner');

        // --- Validate PIN format (must be exactly 4 digits) ---
        if (!/^\d{4}$/.test(pin)) {
            resultDisplay.innerHTML = `
                <div class="error-message">
                    <span class="error-icon">⚠️</span>
                    <p><strong>Invalid PIN format.</strong></p>
                    <p>PIN must be exactly 4 digits (0-9).</p>
                </div>
            `;
            return;
        }

        // Check if currently locked out
        if (Date.now() < lockoutTime) {
            const remaining = Math.ceil((lockoutTime - Date.now()) / 1000);
            resultDisplay.innerHTML = `
                <div class="error-message">
                    <span class="error-icon">⛔</span>
                    <p><strong>Too many failed attempts.</strong></p>
                    <p>Please wait ${remaining} seconds before trying again.</p>
                </div>
            `;
            return;
        }

        // Validate Student ID
        if (!studentId) {
            resultDisplay.innerHTML = `
                <div class="error-message">
                    <span class="error-icon">⚠️</span>
                    <p>Please enter your Student ID.</p>
                </div>
            `;
            return;
        }

        // Show loading spinner
        loadingSpinner.style.display = 'block';
        resultDisplay.innerHTML = '';

        // Fetch the PIN file
        fetch('data/pins.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Could not load PIN data. Please contact school administration.');
                }
                return response.json();
            })
            .then(pins => {
                loadingSpinner.style.display = 'none';

                // Check if the student ID exists in the PIN list
                if (pins.hasOwnProperty(studentId)) {
                    const correctPin = pins[studentId];
                    if (pin === correctPin) {
                        // PIN correct – open the PDF
                        const pdfUrl = `results/${studentId}.pdf`;
                        // Check if PDF exists before opening
                        fetch(pdfUrl, { method: 'HEAD' })
                            .then(res => {
                                if (res.ok) {
                                    window.open(pdfUrl, '_blank');
                                    resultDisplay.innerHTML = `
                                        <div class="success-message">
                                            <span class="success-icon">✅</span>
                                            <p>Access granted! Your results are opening in a new tab.</p>
                                            <p class="small-text">If the PDF doesn't load, <a href="${pdfUrl}" target="_blank">click here</a> to open directly.</p>
                                        </div>
                                    `;
                                    // Reset failed attempts on success
                                    failedAttempts = 0;
                                } else {
                                    // PDF not found (even though PIN is correct)
                                    resultDisplay.innerHTML = `
                                        <div class="error-message">
                                            <span class="error-icon">📄</span>
                                            <p><strong>Results file not found for ${studentId}.</strong></p>
                                            <p>Please contact the school office to report this issue.</p>
                                        </div>
                                    `;
                                }
                            })
                            .catch(() => {
                                resultDisplay.innerHTML = `
                                    <div class="error-message">
                                        <span class="error-icon">📄</span>
                                        <p><strong>Could not access the results file.</strong></p>
                                        <p>Please contact the school office.</p>
                                    </div>
                                `;
                            });
                    } else {
                        // Incorrect PIN
                        failedAttempts++;
                        if (failedAttempts >= MAX_ATTEMPTS) {
                            // Lock out for 60 seconds
                            lockoutTime = Date.now() + 60000; // 1 minute lockout
                            resultDisplay.innerHTML = `
                                <div class="error-message">
                                    <span class="error-icon">⛔</span>
                                    <p><strong>Too many failed attempts.</strong></p>
                                    <p>You have been temporarily locked out for 60 seconds.</p>
                                </div>
                            `;
                        } else {
                            resultDisplay.innerHTML = `
                                <div class="error-message">
                                    <span class="error-icon">🔒</span>
                                    <p><strong>Incorrect PIN.</strong></p>
                                    <p>Please check your PIN and try again.</p>
                                    <p class="small-text">Attempts remaining: ${MAX_ATTEMPTS - failedAttempts}</p>
                                </div>
                            `;
                        }
                    }
                } else {
                    // Student ID not found in PIN list
                    resultDisplay.innerHTML = `
                        <div class="error-message">
                            <span class="error-icon">🔍</span>
                            <p><strong>Student ID not found.</strong></p>
                            <p>Please check your Student ID and try again.</p>
                            <p class="small-text">Format: D25F3118 (ensure letters are uppercase, no spaces)</p>
                        </div>
                    `;
                }
            })
            .catch(error => {
                loadingSpinner.style.display = 'none';
                resultDisplay.innerHTML = `
                    <div class="error-message">
                        <span class="error-icon">⚠️</span>
                        <p><strong>System Error</strong></p>
                        <p>${error.message}</p>
                    </div>
                `;
            });
    };
}

// ============================================================
// 9. UNIVERSITY SELECTIONS PAGE FUNCTIONALITY
// ============================================================

// Only run this code if we're on the university page
if (document.getElementById('uniTable')) {
    
    // ========== DATA ==========
    const studentData = [{
        surname: "PETRO",
        firstname: "CHARITY",
        gender: "F",
        university: "LUANAR",
        program: "BSc. in Animal Science"
    }, {
        surname: "CHIDENGU",
        firstname: "PRECIOUS",
        gender: "M",
        university: "LUANAR",
        program: "BSc. in Agricultural Economics"
    }, {
        surname: "GUNDANI",
        firstname: "DICKSON",
        gender: "M",
        university: "LUANAR",
        program: "BSc. in Aquaculture and Fisheries"
    }, {
        surname: "KAPATA",
        firstname: "PRINCE",
        gender: "M",
        university: "LUANAR",
        program: "BSc. in Aquaculture and Fisheries"
    }, {
        surname: "DICKSON",
        firstname: "CHISOMO",
        gender: "F",
        university: "LUANAR",
        program: "BSc. in Food Technology (NRC)"
    }, {
        surname: "NJAYA",
        firstname: "RODRICK",
        gender: "M",
        university: "LUANAR",
        program: "BSc. in Food Technology (NRC)"
    }, {
        surname: "CHILENGA",
        firstname: "ENWOOD",
        gender: "M",
        university: "LUANAR",
        program: "BSc. In Education Science"
    }, {
        surname: "MAWAYA",
        firstname: "OMAR",
        gender: "M",
        university: "LUANAR",
        program: "BSc. in Crop Sciences"
    }, {
        surname: "SISYA",
        firstname: "TEMWANI",
        gender: "F",
        university: "LUANAR",
        program: "BSc. in Crop Sciences"
    }, {
        surname: "TAPWATA",
        firstname: "TAMICA",
        gender: "F",
        university: "LUANAR",
        program: "BSc. in Crop Sciences"
    }, {
        surname: "WALA",
        firstname: "JASON",
        gender: "M",
        university: "LUANAR",
        program: "Bachelor of Textile and Fashion Design (NRC)"
    }, {
        surname: "CHISALE",
        firstname: "MERVIN",
        gender: "M",
        university: "LUANAR",
        program: "Bachelor of Education Science (NRC)"
    }, {
        surname: "MAGANIZO",
        firstname: "CLEMENT",
        gender: "M",
        university: "LUANAR",
        program: "BSc. FOOD SCIENCE AND TECHNOLOGY"
    }, {
        surname: "CHILEMBA",
        firstname: "CHRISPINE",
        gender: "M",
        university: "LUANAR",
        program: "BSc. AGRICULTURAL ECONOMICS"
    }, {
        surname: "KATSOKA",
        firstname: "FAITH",
        gender: "F",
        university: "LUANAR",
        program: "BSc. AGRIBUSINESS MANAGEMENT"
    }, {
        surname: "KONDOWE",
        firstname: "WISDOM",
        gender: "M",
        university: "LUANAR",
        program: "BACHELORS OF BUSINESS STUDIES"
    }, {
        surname: "CHITEKWE",
        firstname: "HELLINGTON",
        gender: "M",
        university: "MUST",
        program: "BA IN INDIGENOUS KNOWLEDGE SYSTEMS AND PRACTICES (IKSP)"
    }, {
        surname: "MADOGO",
        firstname: "DANIEL",
        gender: "M",
        university: "MUST",
        program: "BACHELOR OF ENGINEERING (HONS) IN BIOMEDICAL ENGINEERING"
    }, {
        surname: "KAMWENDO",
        firstname: "OBVIOUS",
        gender: "M",
        university: "MUST",
        program: "BSc. IN BUSINESS INFORMATION TECHNOLOGY"
    }, {
        surname: "KAPITAPITA",
        firstname: "TONY",
        gender: "M",
        university: "MUST",
        program: "BSc. IN BUSINESS INFORMATION TECHNOLOGY"
    }, {
        surname: "KIMU",
        firstname: "ANDREW",
        gender: "M",
        university: "MUST",
        program: "BSc. IN SCIENCES EDUCATION"
    }, {
        surname: "MKANDAWIRE",
        firstname: "BLESSINGS CK",
        gender: "M",
        university: "MUST",
        program: "BSc. IN SCIENCES EDUCATION"
    }, {
        surname: "MPUNGA",
        firstname: "EKARI",
        gender: "M",
        university: "UNIMA",
        program: "Bachelor of Social Science"
    }, {
        surname: "GOMANI",
        firstname: "GETRUDE R.",
        gender: "F",
        university: "UNIMA",
        program: "Bachelor of Social Science"
    }, {
        surname: "BANDA",
        firstname: "CHRISTIAN",
        gender: "M",
        university: "UNIMA",
        program: "BA in Humanities"
    }, {
        surname: "DAMALEKANI",
        firstname: "PATIENCE",
        gender: "F",
        university: "UNIMA",
        program: "BA in Humanities"
    }, {
        surname: "PHIRI",
        firstname: "SEAN T.",
        gender: "M",
        university: "UNIMA",
        program: "BACHELOR OF EDUCATION (COMPUTER SCIENCE)"
    }, {
        surname: "MISHINDO",
        firstname: "MIKE",
        gender: "M",
        university: "UNIMA",
        program: "BACHELOR OF EDUCATION (HUMAN ECOLOGY)"
    }, {
        surname: "MUKOVOLE",
        firstname: "REBECCA",
        gender: "F",
        university: "UNIMA",
        program: "BSc. IN BIOLOGICAL SCIENCES"
    }, {
        surname: "KANAMA",
        firstname: "PATIENCE",
        gender: "F",
        university: "UNIMA",
        program: "BSc. IN ELECTRONICS"
    }, {
        surname: "NKHWAZI",
        firstname: "VINJERU",
        gender: "M",
        university: "UNIMA",
        program: "BSc. IN STATISTICS"
    }, {
        surname: "NOTI",
        firstname: "BLESSINGS",
        gender: "M",
        university: "UNIMA",
        program: "BA IN SOCIAL AND ECONOMIC HISTORY"
    }, {
        surname: "KACHIGAYO",
        firstname: "THANDIZO",
        gender: "F",
        university: "UNIMA",
        program: "BACHELOR OF SOCIAL SCIENCE IN POPULATION STUDIES"
    }, {
        surname: "MHONE",
        firstname: "ROBERT",
        gender: "M",
        university: "UNIMA",
        program: "BA IN INTERNATIONAL RELATIONS AND DIPLOMACY"
    }, {
        surname: "CHIUMIA",
        firstname: "THULANI",
        gender: "M",
        university: "UNIMA",
        program: "BA PUBLIC ADMINISTRATION"
    }, {
        surname: "PHIRI",
        firstname: "CHISOMO",
        gender: "M",
        university: "UNIMA",
        program: "BSc. GEOGRAPHY"
    }, {
        surname: "MWANZA",
        firstname: "ELIJAH",
        gender: "M",
        university: "UNIMA",
        program: "BA PUBLIC ADMINISTRATION"
    }, {
        surname: "Bikosi",
        firstname: "Candice",
        gender: "F",
        university: "KUHES",
        program: "BACHELOR OF PHYSIOTHERAPY (HONOURS)"
    }, {
        surname: "Matiki",
        firstname: "Charity V.",
        gender: "F",
        university: "KUHES",
        program: "BSc. IN NUTRITION AND DIETETICS (HONOURS)"
    }, {
        surname: "Nkhungulu",
        firstname: "Naphtali Charles",
        gender: "M",
        university: "KUHES",
        program: "BSc. IN NUTRITION AND DIETETICS (HONOURS)"
    }, {
        surname: "Wyson",
        firstname: "Pempho Matiki",
        gender: "M",
        university: "KUHES",
        program: "BSc. IN NURSING AND MIDWIFERY"
    }, {
        surname: "MWASI",
        firstname: "LEMEKEZANI",
        gender: "M",
        university: "MUBAS",
        program: "BACHELOR OF ACCOUNTANCY"
    }, {
        surname: "MWENYEKONDO",
        firstname: "UMNAH",
        gender: "F",
        university: "MUBAS",
        program: "BA IN JOURNALISM"
    }, {
        surname: "MGOMBA",
        firstname: "HAWAH TAMIMO",
        gender: "F",
        university: "MUBAS",
        program: "BA IN PUBLIC RELATIONS"
    }, {
        surname: "MWALOWA",
        firstname: "SANDRA",
        gender: "F",
        university: "MUBAS",
        program: "BACHELOR OF EDUCATION (BUSINESS AND COMPUTER STUDIES)"
    }, {
        surname: "KAITANO",
        firstname: "YAMIKANI",
        gender: "M",
        university: "MUBAS",
        program: "BACHELOR OF MECHANICAL ENGINEERING (HONOURS)"
    }, {
        surname: "MANDALA",
        firstname: "MICHELLE",
        gender: "F",
        university: "MUBAS",
        program: "BACHELOR OF MINING ENGINEERING (HONOURS)"
    }, {
        surname: "CHIMPEPA",
        firstname: "PRAISE",
        gender: "F",
        university: "MUBAS",
        program: "BSc. IN INDUSTRIAL LABORATORY TECHNOLOGY"
    }, {
        surname: "SIMKONDA",
        firstname: "CAROLINE MALANGA",
        gender: "F",
        university: "MUBAS",
        program: "BSc. IN OCCUPATIONAL SAFETY AND HEALTH"
    }, {
        surname: "NYANGALA",
        firstname: "Madalitso",
        gender: "M",
        university: "MZUNI",
        program: "BSc. in Transformative Community Development"
    }, {
        surname: "PHIRI",
        firstname: "Triza",
        gender: "F",
        university: "MZUNI",
        program: "Bachelor of Library and Information Science"
    }, {
        surname: "ZINGA",
        firstname: "Cuthbert",
        gender: "M",
        university: "MZUNI",
        program: "Bachelor of Library and Information Science"
    }, {
        surname: "BANDA",
        firstname: "Chimango Peace",
        gender: "M",
        university: "MZUNI",
        program: "BSc. in Renewable Energy Systems Engineering"
    }, {
        surname: "MWALWANDA",
        firstname: "Lumbani",
        gender: "M",
        university: "MZUNI",
        program: "BSc. in Renewable Energy Systems Engineering"
    }, {
        surname: "NYALO",
        firstname: "Destiny",
        gender: "M",
        university: "MZUNI",
        program: "BSc. in Renewable Energy Systems Engineering"
    }, {
        surname: "MIDWA",
        firstname: "Thom",
        gender: "M",
        university: "MZUNI",
        program: "BSc. (Fisheries and Aquatic Sciences)"
    }, {
        surname: "MATONGA",
        firstname: "Emmanuel",
        gender: "M",
        university: "MZUNI",
        program: "Bachelor of Business (Tourism Management)"
    }, {
        surname: "KAMFOSI",
        firstname: "Steven",
        gender: "M",
        university: "MZUNI",
        program: "BSc. in Information and Communication Technology"
    }, {
        surname: "MALUNGA",
        firstname: "Yussuf",
        gender: "M",
        university: "MZUNI",
        program: "BSc. (Honours) in Renewable Energy Systems Engineering"
    }, {
        surname: "STOPE",
        firstname: "Mphatso",
        gender: "F",
        university: "MZUNI",
        program: "BSc. (Forestry)"
    }, {
        surname: "NKHATA",
        firstname: "Menard",
        gender: "M",
        university: "MZUNI",
        program: "BSc. (Fisheries and Aquatic Sciences)"
    }];

    // ========== TABLE FUNCTIONS ==========
    // Store the currently filtered/sorted data
    let currentDisplayData = [...studentData];

    function renderTable(data) {
        const tbody = document.getElementById('tableBody');
        if (data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: #94a3b8;">
                        No students match your search criteria.
                    </td>
                </tr>
            `;
            document.getElementById('visibleCount').textContent = 0;
            document.getElementById('totalCount').textContent = studentData.length;
            return;
        }
        // Generate row numbers dynamically based on current display order
        tbody.innerHTML = data.map((s, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${s.surname}</td>
                <td>${s.firstname}</td>
                <td><span class="gender-badge ${s.gender === 'M' ? 'male' : 'female'}">${s.gender}</span></td>
                <td><span class="uni-badge">${s.university}</span></td>
                <td>${s.program}</td>
            </tr>
        `).join('');
        document.getElementById('visibleCount').textContent = data.length;
        document.getElementById('totalCount').textContent = studentData.length;
        currentDisplayData = data;
    }

    function filterTable() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const uniFilter = document.getElementById('uniFilter').value;

        const filtered = studentData.filter(s => {
            const matchSearch = s.surname.toLowerCase().includes(searchTerm) ||
                s.firstname.toLowerCase().includes(searchTerm) ||
                s.program.toLowerCase().includes(searchTerm) ||
                s.university.toLowerCase().includes(searchTerm);
            const matchUni = uniFilter === 'all' || s.university === uniFilter;
            return matchSearch && matchUni;
        });

        renderTable(filtered);
    }

    // Sorting
    let sortDirection = {};
    let sortColumn = null;

    window.sortTable = function(colIndex) {
        // Column headers: 0=NO, 1=Surname, 2=First Name, 3=Gender, 4=University, 5=Program
        const headers = ['surname', 'firstname', 'gender', 'university', 'program'];
        
        // Ignore sorting on the "NO." column (index 0)
        if (colIndex === 0) return;

        const key = headers[colIndex - 1];

        if (sortColumn === colIndex) {
            sortDirection[colIndex] = !sortDirection[colIndex];
        } else {
            sortColumn = colIndex;
            sortDirection[colIndex] = true;
        }

        // Get the currently filtered data (not the full dataset)
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const uniFilter = document.getElementById('uniFilter').value;
        
        // First, get the filtered list
        const filtered = studentData.filter(s => {
            const matchSearch = s.surname.toLowerCase().includes(searchTerm) ||
                s.firstname.toLowerCase().includes(searchTerm) ||
                s.program.toLowerCase().includes(searchTerm) ||
                s.university.toLowerCase().includes(searchTerm);
            const matchUni = uniFilter === 'all' || s.university === uniFilter;
            return matchSearch && matchUni;
        });

        // Then sort the filtered list
        const sorted = [...filtered].sort((a, b) => {
            let valA = a[key];
            let valB = b[key];
            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();
            if (valA < valB) return sortDirection[colIndex] ? -1 : 1;
            if (valA > valB) return sortDirection[colIndex] ? 1 : -1;
            return 0;
        });

        renderTable(sorted);
    };

    // ========== CHART.JS - GRAPHS ==========
    document.addEventListener('DOMContentLoaded', function() {
        // Count data for charts
        const uniCounts = {};
        const genderCounts = { M: 0, F: 0 };
        studentData.forEach(s => {
            uniCounts[s.university] = (uniCounts[s.university] || 0) + 1;
            genderCounts[s.gender] = (genderCounts[s.gender] || 0) + 1;
        });

        const uniLabels = Object.keys(uniCounts);
        const uniValues = Object.values(uniCounts);

        // Color palette
        const colors = ['#264653', '#f46161', '#532648', '#e76f51', '#332e30', '#5a8f7c'];

        // 1. University Distribution Bar Chart
        new Chart(document.getElementById('uniChart'), {
            type: 'bar',
            data: {
                labels: uniLabels,
                datasets: [{
                    label: 'Students Selected',
                    data: uniValues,
                    backgroundColor: colors.slice(0, uniLabels.length),
                    borderColor: colors.slice(0, uniLabels.length),
                    borderWidth: 2,
                    borderRadius: 6,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });

        // 2. Gender Distribution Pie Chart
        new Chart(document.getElementById('genderChart'), {
            type: 'doughnut',
            data: {
                labels: ['Male', 'Female'],
                datasets: [{
                    data: [genderCounts.M, genderCounts.F],
                    backgroundColor: ['#264653', '#f46161'],
                    borderColor: ['#264653', '#ffffff'],
                    borderWidth: 4,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: { size: 14 }
                        }
                    }
                }
            }
        });

        // 3. Selection Rate Gauge/Doughnut Chart
        const selectionRate = 81;
        new Chart(document.getElementById('selectionChart'), {
            type: 'doughnut',
            data: {
                labels: ['Selected (81%)', 'Not Selected (19%)'],
                datasets: [{
                    data: [selectionRate, 100 - selectionRate],
                    backgroundColor: ['#032f44', '#c2ccda'],
                    borderColor: ['#032f44', '#ffffff'],
                    borderWidth: 4,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: { size: 14 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.parsed + '%';
                            }
                        }
                    }
                }
            },
            plugins: [{
                id: 'centerText',
                beforeDraw: function(chart) {
                    const { width, height, ctx } = chart;
                    ctx.save();
                    const text = '81%';
                    const fontSize = (height / 6);
                    ctx.font = `bold ${fontSize}px 'Segoe UI', sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = '#0a1a3a';
                    ctx.fillText(text, width / 2, height / 2 - 8);
                    ctx.font = `${fontSize/2.5}px 'Segoe UI', sans-serif`;
                    ctx.fillStyle = '#475569';
                    ctx.fillText('Selection Rate', width / 2, height / 2 + fontSize/2);
                    ctx.restore();
                }
            }]
        });

        // ========== INITIAL TABLE RENDER ==========
        renderTable(studentData);

        // ========== EVENT LISTENERS ==========
        document.getElementById('searchInput').addEventListener('input', filterTable);
        document.getElementById('uniFilter').addEventListener('change', filterTable);
    });
}