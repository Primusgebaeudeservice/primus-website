/* ==========================================================================
   PRIMUS GEBÄUDESERVICE - SCRIPTS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // 1. HEADER SCROLL STATE
    const header = document.getElementById('header');
    
    function checkHeaderScroll() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
    
    // Initial check and event listener
    checkHeaderScroll();
    window.addEventListener('scroll', checkHeaderScroll);


    // 2. MOBILE MENU / BURGER TOGGLE
    const burgerBtn = document.getElementById('burger-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    
    function toggleMobileMenu() {
        const isOpen = burgerBtn.classList.toggle('open');
        mobileMenu.classList.toggle('open');
        burgerBtn.setAttribute('aria-expanded', isOpen);
        
        // Toggle scroll lock on body
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }
    
    burgerBtn.addEventListener('click', toggleMobileMenu);
    
    // Close menu when clicking on any links
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenu.classList.contains('open')) {
                toggleMobileMenu();
            }
        });
    });


    // 3. SMOOTH NAVIGATION ANCHORS WITH HEADER OFFSET
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link, a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            // Skip if it's only a close trigger or modal trigger
            if (targetId === '#' || targetId === '#impressum' || targetId === '#datenschutz') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                // Get header height for offset
                const headerHeight = header.offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });


    // 4. ACTIVE LINK SELECTION ON SCROLL (SCROLLSPY)
    const sections = document.querySelectorAll('section[id]');
    const desktopLinks = document.querySelectorAll('.desktop-nav .nav-link');
    
    function activeNavLinkOnScroll() {
        const scrollPosition = window.scrollY + 120; // offset
        
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            
            if (scrollPosition >= top && scrollPosition < top + height) {
                desktopLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    window.addEventListener('scroll', activeNavLinkOnScroll);


    // 5. SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            root: null, // viewport
            rootMargin: '0px',
            threshold: 0.15 // trigger when 15% visible
        };
        
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target); // only animate once
                }
            });
        }, observerOptions);
        
        revealElements.forEach(element => {
            revealObserver.observe(element);
        });
    } else {
        // Fallback for older browsers
        revealElements.forEach(element => {
            element.classList.add('revealed');
        });
    }

    // MOBILE SERVICES ACCORDION
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    // Initialize open items heights for smooth transitions
    const activeAccordions = document.querySelectorAll('.accordion-item.active');
    activeAccordions.forEach(item => {
        const content = item.querySelector('.accordion-content');
        if (content) {
            content.style.maxHeight = content.scrollHeight + 'px';
        }
    });
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const item = this.parentElement;
            const content = item.querySelector('.accordion-content');
            
            const isOpen = item.classList.contains('active');
            
            // Close all other items to keep it compact
            document.querySelectorAll('.accordion-item').forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                    const otherContent = otherItem.querySelector('.accordion-content');
                    if (otherContent) {
                        otherContent.style.maxHeight = '0px';
                    }
                    const otherHeader = otherItem.querySelector('.accordion-header');
                    if (otherHeader) {
                        otherHeader.setAttribute('aria-expanded', 'false');
                    }
                }
            });
            
            // Toggle current item
            if (isOpen) {
                item.classList.remove('active');
                if (content) content.style.maxHeight = '0px';
                this.setAttribute('aria-expanded', 'false');
            } else {
                item.classList.add('active');
                if (content) content.style.maxHeight = content.scrollHeight + 'px';
                this.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // 6. REFERENCES / PROJECTS GALLERY FILTER
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active from all
            filterButtons.forEach(b => b.classList.remove('active'));
            // Add active to current
            this.classList.add('active');
            
            const filterValue = this.getAttribute('data-filter');
            
            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filterValue === 'all' || category === filterValue) {
                    card.classList.remove('hide');
                    // Retrigger reveal check
                    setTimeout(() => {
                        card.classList.add('revealed');
                    }, 50);
                } else {
                    card.classList.add('hide');
                }
            });
        });
    });



    // 8. FORM VALIDATION & SUBMISSION HANDLE
    const inquiryForm = document.getElementById('inquiry-form');
    const formSuccess = document.getElementById('form-success');
    const submitBtn = document.getElementById('submit-btn');
    const formSpinner = document.getElementById('form-spinner');
    
    if (inquiryForm) {
        inquiryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Clean previous errors
            const formGroups = inquiryForm.querySelectorAll('.form-group');
            formGroups.forEach(group => group.classList.remove('has-error'));
            
            let isValid = true;
            
            // Validate Name
            const nameInput = document.getElementById('form-name');
            if (!nameInput.value.trim()) {
                nameInput.parentElement.classList.add('has-error');
                isValid = false;
            }
            
            // Validate Phone
            const phoneInput = document.getElementById('form-phone');
            if (!phoneInput.value.trim()) {
                phoneInput.parentElement.classList.add('has-error');
                isValid = false;
            }
            
            // Validate Email
            const emailInput = document.getElementById('form-email');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
                emailInput.parentElement.classList.add('has-error');
                isValid = false;
            }
            
            // Validate Objektart
            const objektSelect = document.getElementById('form-objekt');
            if (!objektSelect.value) {
                objektSelect.parentElement.classList.add('has-error');
                isValid = false;
            }
            
            // Validate Ort
            const ortInput = document.getElementById('form-ort');
            if (!ortInput.value.trim()) {
                ortInput.parentElement.classList.add('has-error');
                isValid = false;
            }
            
            // Validate at least one service checkbox is checked
            const serviceCheckboxes = inquiryForm.querySelectorAll('input[name="leistung"]:checked');
            if (serviceCheckboxes.length === 0) {
                // Find parent container of checkboxes and flag it
                const servicesCheckboxGrid = inquiryForm.querySelector('.services-checkbox-grid');
                servicesCheckboxGrid.parentElement.classList.add('has-error');
                isValid = false;
            }
            
            // Validate Privacy Checkbox
            const privacyCheckbox = document.getElementById('form-privacy');
            if (!privacyCheckbox.checked) {
                privacyCheckbox.parentElement.parentElement.classList.add('has-error');
                isValid = false;
            }
            
            // If valid, submit form
            if (isValid) {
                // Honeypot bot check
                const botcheck = inquiryForm.querySelector('input[name="botcheck"]');
                if (botcheck && botcheck.checked) {
                    console.log('Bot detected. Submission blocked.');
                    return;
                }

                // Enter loading state
                const originalBtnText = submitBtn.querySelector('.btn-text').textContent;
                submitBtn.querySelector('.btn-text').textContent = 'Wird gesendet...';
                submitBtn.classList.add('loading');
                submitBtn.disabled = true;

                // Remove previous general error if exists
                const existingError = inquiryForm.querySelector('.form-general-error');
                if (existingError) existingError.remove();

                const formData = new FormData(inquiryForm);

                fetch("https://api.web3forms.com/submit", {
                    method: "POST",
                    body: formData
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        // Hide form, show success message
                        inquiryForm.style.display = 'none';
                        formSuccess.style.display = 'block';
                        inquiryForm.reset();

                        // Smooth scroll to top of form section to show success
                        const targetElement = document.getElementById('anfrage');
                        const headerHeight = header.offsetHeight;
                        const elementPosition = targetElement.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
                        
                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    } else {
                        throw new Error(result.message || 'Error from Web3Forms');
                    }
                })
                .catch(error => {
                    console.error('Submission failed:', error);
                    
                    // Show error message above submit button
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'form-general-error';
                    errorDiv.style.color = '#ef4444';
                    errorDiv.style.fontSize = '0.85rem';
                    errorDiv.style.marginTop = '0.75rem';
                    errorDiv.style.textAlign = 'center';
                    errorDiv.style.fontFamily = 'var(--font-body)';
                    errorDiv.textContent = 'Die Anfrage konnte leider nicht gesendet werden. Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt telefonisch.';
                    
                    submitBtn.parentNode.insertBefore(errorDiv, submitBtn);
                    
                    // Reset button state
                    submitBtn.querySelector('.btn-text').textContent = originalBtnText;
                    submitBtn.classList.remove('loading');
                    submitBtn.disabled = false;
                });
            } else {
                // Scroll to the first error element
                const firstError = inquiryForm.querySelector('.has-error');
                if (firstError) {
                    const headerHeight = header.offsetHeight;
                    const elementPosition = firstError.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 30; // buffer
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    }


    // 9. LEGAL PAGES CONTENT POPULATION & MODAL HANDLER
    const legalModal = document.getElementById('legal-modal');
    const modalCloseBtn = document.getElementById('modal-close');
    const modalContentArea = document.getElementById('modal-content-area');
    
    const impressumTrigger = document.getElementById('impressum-trigger');
    const datenschutzTrigger = document.getElementById('datenschutz-trigger');
    
    const impressumContent = `
        <h2>Impressum</h2>
        <p><strong>Angaben gemäß § 5 TMG:</strong></p>
        <p>PRIMUS Gebäudeservice<br>
        Ömer Bulut<br>
        Einsatzgebiet: Berlin & Brandenburg</p>
        
        <h3>Kontakt:</h3>
        <p>Telefon: +49 157 / 804 72 086<br>
        E-Mail: primusgebaeudeservice@gmail.com</p>
        
        <h3>Berufsbezeichnung und rechtliche Einordnung:</h3>
        <p>Gewerbeanmeldung für Gebäudereinigung, Hausmeisterservice und Objektbetreuung.<br>
        Es werden ausschließlich Tätigkeiten ausgeübt, die keine Zulassungspflicht nach Anlage A der Handwerksordnung (HwO) erfordern. Die Erbringung von Leistungen umfasst zulassungsfreie Tätigkeiten der Anlage B der Handwerksordnung (z.B. Holz- und Bautenschutz, Gartenpflege, einfache Instandhaltungs- und Kleinreparaturarbeiten ohne Meisterpflicht).</p>
        
        <h3>Aufsichtsbehörde:</h3>
        <p>Gewerbeamt Berlin</p>
        
        <h3>Streitschlichtung:</h3>
        <p>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: <a href="https://ec.europa.eu/consumers/odr" target="_blank" class="link-gold">https://ec.europa.eu/consumers/odr</a>.<br>
        Unsere E-Mail-Adresse finden Sie oben im Impressum.</p>
        <p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
        
        <h3>Haftung für Inhalte:</h3>
        <p>Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.</p>
        <p>Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.</p>
        
        <h3>Haftung für Links:</h3>
        <p>Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.</p>
        <p>Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.</p>
        
        <h3>Urheberrecht:</h3>
        <p>Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.</p>
        <p>Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.</p>
    `;
    
    const datenschutzContent = `
        <h2>Datenschutzerklärung</h2>
        <h3>1. Datenschutz auf einen Blick</h3>
        <p><strong>Allgemeine Hinweise:</strong><br>
        Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können. Ausführliche Informationen zum Thema Datenschutz entnehmen Sie unserer unter diesem Text aufgeführten Datenschutzerklärung.</p>
        
        <p><strong>Datenerfassung auf dieser Website:</strong><br>
        Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Abschnitt „Hinweis zur Verantwortlichen Stelle“ in dieser Datenschutzerklärung entnehmen.</p>
        
        <p><strong>Wie erfassen wir Ihre Daten?</strong><br>
        Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z. B. um Daten handeln, die Sie in unser Anfrageformular eingeben.<br>
        Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z. B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs). Die Erfassung dieser Daten erfolgt automatisch, sobald Sie diese Website betreten.</p>
        
        <p><strong>Wofür nutzen wir Ihre Daten?</strong><br>
        Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu gewährleisten. Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden. Ihre Anfrage-Daten nutzen wir ausschließlich zur Bearbeitung und Erstellung Ihres Kostenvoranschlags.</p>
        
        <h3>2. Allgemeine Hinweise und Pflichtinformationen</h3>
        <p><strong>Datenschutz:</strong><br>
        Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.<br>
        Wenn Sie diese Website benutzen, werden verschiedene personenbezogene Daten erhoben. Diese Datenschutzerklärung erläutert, welche Daten wir erheben und wofür wir sie nutzen. Sie erläutert auch, wie und zu welchem Zweck das geschieht.</p>
        
        <p><strong>Hinweis zur verantwortlichen Stelle:</strong><br>
        Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:<br>
        PRIMUS Gebäudeservice<br>
        Inhaber: Ömer Bulut<br>
        E-Mail: primusgebaeudeservice@gmail.com<br>
        Telefon: +49 157 / 804 72 086</p>
        
        <p>Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder gemeinsam mit anderen über die Zwecke und Mittel der Verarbeitung von personenbezogenen Daten (z. B. Namen, E-Mail-Adressen o. Ä.) entscheidet.</p>
        
        <p><strong>Speicherdauer:</strong><br>
        Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt wurde, verbleiben Ihre personenbezogenen Daten bei uns, bis der Zweck für die Datenverarbeitung entfällt. Wenn Sie ein berechtigtes Löschersuchen geltend machen oder eine Einwilligung zur Datenverarbeitung widerrufen, werden Ihre Daten gelöscht, sofern wir keine anderen rechtlich zulässigen Gründe für die Speicherung Ihrer personenbezogenen Daten haben (z. B. steuer- oder handelsrechtliche Aufbewahrungsfristen); im letztgenannten Fall erfolgt die Löschung nach Fortfall dieser Gründe.</p>
        
        <p><strong>Ihre Rechte:</strong><br>
        Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung oder Löschung dieser Daten zu verlangen. Wenn Sie eine Einwilligung zur Datenverarbeitung erteilt haben, können Sie diese Einwilligung jederzeit für die Zukunft widerrufen. Außerdem haben Sie das Recht, unter bestimmten Umständen die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen.</p>
        
        <h3>3. Datenerfassung auf unserer Website</h3>
        <p><strong>Anfrageformular:</strong><br>
        Wenn Sie uns per Anfrageformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.<br>
        Die Verarbeitung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO, sofern Ihre Anfrage mit der Erfüllung eines Vertrags zusammenhängt oder zur Durchführung vorvertraglicher Maßnahmen erforderlich ist. In allen übrigen Fällen beruht die Verarbeitung auf unserem berechtigten Interesse an der effektiven Bearbeitung der an uns gerichteten Anfragen (Art. 6 Abs. 1 lit. f DSGVO) oder auf Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) falls diese abgefragt wurde.<br>
        Die von Ihnen im Anfrageformular eingegebenen Daten verbleiben bei uns, bis Sie uns zur Löschung auffordern, Ihre Einwilligung zur Speicherung widerrufen oder der Zweck für die Datenspeicherung entfällt (z. B. nach abgeschlossener Bearbeitung Ihrer Anfrage). Zwingende gesetzliche Bestimmungen – insbesondere Aufbewahrungsfristen – bleiben unberührt.</p>
    `;
    
    function openLegalModal(content) {
        modalContentArea.innerHTML = content;
        legalModal.classList.add('open');
        document.body.style.overflow = 'hidden'; // lock background scroll
    }
    
    function closeLegalModal() {
        legalModal.classList.remove('open');
        // Restore background scroll only if mobile nav is not open
        if (!mobileMenu.classList.contains('open')) {
            document.body.style.overflow = '';
        }
    }
    
    impressumTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        openLegalModal(impressumContent);
    });
    
    datenschutzTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        openLegalModal(datenschutzContent);
    });
    
    modalCloseBtn.addEventListener('click', closeLegalModal);
    
    // Close by clicking overlay backdrop
    legalModal.addEventListener('click', (e) => {
        if (e.target === legalModal) {
            closeLegalModal();
        }
    });
    
    // Close modal on Escape key press
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && legalModal.classList.contains('open')) {
            closeLegalModal();
        }
    });

    // 10. BEFORE/AFTER IMAGE SLIDER (supports multiple sliders)
    const baContainers = document.querySelectorAll('.before-after-container');
    
    baContainers.forEach(container => {
        const slider = container.querySelector('.ba-slider');
        const afterImage = container.querySelector('.ba-after');
        const handle = container.querySelector('.ba-handle');
        
        if (slider && afterImage && handle) {
            const updateSlider = () => {
                const value = slider.value;
                afterImage.style.clipPath = `inset(0 0 0 ${value}%)`;
                handle.style.left = `${value}%`;
            };
            
            slider.addEventListener('input', updateSlider);
            slider.addEventListener('change', updateSlider);
            
            // Initialize position
            updateSlider();
        }
    });

    // ==========================================================================
    // 11. COOKIE CONSENT BANNER & SETTINGS MODAL LOGIC
    // ==========================================================================
    const cookieBanner = document.getElementById('cookie-consent-banner');
    const cookieModal = document.getElementById('cookie-settings-modal');
    
    // Banner Buttons
    const btnAcceptAll = document.getElementById('cookie-accept-all');
    const btnAcceptNecessary = document.getElementById('cookie-accept-necessary');
    const btnOpenSettings = document.getElementById('cookie-open-settings');
    
    // Modal Buttons
    const btnModalClose = document.getElementById('cookie-modal-close-btn');
    const btnSaveSettings = document.getElementById('cookie-save-settings');
    const btnModalAcceptAll = document.getElementById('cookie-modal-accept-all');
    const btnModalAcceptNecessary = document.getElementById('cookie-modal-accept-necessary');
    
    // Toggles
    const toggleAnalytics = document.getElementById('cookie-toggle-analytics');
    const toggleMarketing = document.getElementById('cookie-toggle-marketing');
    
    // Triggers
    const cookieSettingsTrigger = document.getElementById('cookie-settings-trigger');
    const cookieLinkDatenschutz = document.getElementById('cookie-link-datenschutz');
    const cookieLinkImpressum = document.getElementById('cookie-link-impressum');

    const consentKey = 'primus_cookie_consent';
    const consentVersion = '1.0';

    // Helper: Save consent to LocalStorage
    const saveConsent = (analytics, marketing) => {
        const consentObj = {
            necessary: true,
            analytics: analytics,
            marketing: marketing,
            timestamp: new Date().toISOString(),
            version: consentVersion
        };
        localStorage.setItem(consentKey, JSON.stringify(consentObj));
        
        // Expose consent status globally
        window.PRIMUS_CONSENT = consentObj;
        
        // Dispatch custom event to notify external tracking scripts
        window.dispatchEvent(new CustomEvent('primusCookieConsentChange', { detail: consentObj }));
        
        hideBanner();
        closeModal();
    };

    // Helper: Get consent from LocalStorage
    const getConsent = () => {
        const rawConsent = localStorage.getItem(consentKey);
        if (!rawConsent) return null;
        try {
            return JSON.parse(rawConsent);
        } catch (e) {
            return null;
        }
    };

    // Show/Hide Banner
    const showBanner = () => {
        if (cookieBanner) {
            cookieBanner.classList.add('show');
        }
    };

    const hideBanner = () => {
        if (cookieBanner) {
            cookieBanner.classList.remove('show');
        }
    };

    // Open/Close Modal
    const openModal = () => {
        if (cookieModal) {
            // Pre-populate toggles based on current consent
            const currentConsent = getConsent() || { analytics: false, marketing: false };
            if (toggleAnalytics) toggleAnalytics.checked = currentConsent.analytics;
            if (toggleMarketing) toggleMarketing.checked = currentConsent.marketing;
            
            cookieModal.classList.add('open');
            cookieModal.setAttribute('aria-hidden', 'false');
            
            // Set focus inside the modal for accessibility
            const closeBtn = document.getElementById('cookie-modal-close-btn');
            if (closeBtn) closeBtn.focus();
        }
    };

    const closeModal = () => {
        if (cookieModal) {
            cookieModal.classList.remove('open');
            cookieModal.setAttribute('aria-hidden', 'true');
        }
    };

    // Initialize Cookie Consent System
    const initCookieConsent = () => {
        const currentConsent = getConsent();
        
        if (!currentConsent || currentConsent.version !== consentVersion) {
            // Show banner after a short delay
            setTimeout(showBanner, 800);
            window.PRIMUS_CONSENT = { necessary: true, analytics: false, marketing: false };
        } else {
            // Consent already recorded: expose it
            window.PRIMUS_CONSENT = currentConsent;
            window.dispatchEvent(new CustomEvent('primusCookieConsentChange', { detail: currentConsent }));
        }
        
        // Add Event Listeners for Banner buttons
        if (btnAcceptAll) {
            btnAcceptAll.addEventListener('click', () => saveConsent(true, true));
        }
        if (btnAcceptNecessary) {
            btnAcceptNecessary.addEventListener('click', () => saveConsent(false, false));
        }
        if (btnOpenSettings) {
            btnOpenSettings.addEventListener('click', openModal);
        }
        
        // Add Event Listeners for Modal buttons
        if (btnModalClose) {
            btnModalClose.addEventListener('click', closeModal);
        }
        if (btnSaveSettings) {
            btnSaveSettings.addEventListener('click', () => {
                const analytics = toggleAnalytics ? toggleAnalytics.checked : false;
                const marketing = toggleMarketing ? toggleMarketing.checked : false;
                saveConsent(analytics, marketing);
            });
        }
        if (btnModalAcceptAll) {
            btnModalAcceptAll.addEventListener('click', () => saveConsent(true, true));
        }
        if (btnModalAcceptNecessary) {
            btnModalAcceptNecessary.addEventListener('click', () => saveConsent(false, false));
        }
        
        // Overlay click closes modal
        const modalOverlay = cookieModal ? cookieModal.querySelector('.cookie-modal-overlay') : null;
        if (modalOverlay) {
            modalOverlay.addEventListener('click', closeModal);
        }
        
        // Close on Escape key press
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && cookieModal && cookieModal.classList.contains('open')) {
                closeModal();
            }
        });
        
        // Footer trigger to re-open modal
        if (cookieSettingsTrigger) {
            cookieSettingsTrigger.addEventListener('click', (e) => {
                e.preventDefault();
                openModal();
            });
        }
        
        // Banner link overrides to open Datenschutz/Impressum modals smoothly
        if (cookieLinkDatenschutz && typeof openLegalModal === 'function') {
            cookieLinkDatenschutz.addEventListener('click', (e) => {
                e.preventDefault();
                openLegalModal(datenschutzContent);
            });
        }
        if (cookieLinkImpressum && typeof openLegalModal === 'function') {
            cookieLinkImpressum.addEventListener('click', (e) => {
                e.preventDefault();
                openLegalModal(impressumContent);
            });
        }
    };

    // Run Initialization
    initCookieConsent();

});
