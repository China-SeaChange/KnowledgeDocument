(function() {
    const navHeaders = document.querySelectorAll('.nav-header');
    navHeaders.forEach(header => {
        const childrenDiv = header.nextElementSibling;
        const icon = header.querySelector('.fold-icon');
        header.addEventListener('click', () => {
            const hide = childrenDiv.style.display === 'none';
            childrenDiv.style.display = hide ? 'block' : 'none';
            icon.textContent = hide ? '▼' : '▲';
        });
    });

    const menuToggle = document.getElementById('menuToggle');
    const leftNav = document.getElementById('leftNav');
    const navOverlay = document.getElementById('navOverlay');
    if(menuToggle) {
        menuToggle.onclick = () => {
            leftNav.classList.toggle('visible');
            navOverlay.classList.toggle('visible');
        };
    }
    navOverlay.onclick = () => {
        leftNav.classList.remove('visible');
        navOverlay.classList.remove('visible');
    };

    const resizeHandle = document.getElementById('resizeHandle');
    let isResizing = false;
    if(resizeHandle) {
        resizeHandle.addEventListener('mousedown', e => {
            isResizing = true;
            const startW = leftNav.offsetWidth;
            document.onmousemove = ev => {
                if(!isResizing) return;
                let w = startW + (ev.clientX - e.clientX);
                w = Math.max(240, Math.min(500, w));
                leftNav.style.width = w + 'px';
            };
            document.onmouseup = () => isResizing = false;
        });
    }

    const searchInput = document.getElementById('searchInput');
    const searchDropdown = document.getElementById('searchDropdown');
    const mainContent = document.getElementById('mainContent');
    const markInstance = new Mark(mainContent);

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function getSearchableElements() {
        const elements = [];
        mainContent.querySelectorAll('h2, h3, h4, p, li, td').forEach(el => {
            if (el.textContent.trim()) {
                elements.push({ element: el, text: el.textContent.trim() });
            }
        });
        return elements;
    }

    searchInput.addEventListener('input', function(e) {
        const rawKw = e.target.value;
        const kw = rawKw.trim().toLowerCase();
        if (!kw) {
            searchDropdown.style.display = 'none';
            return;
        }
        const elements = getSearchableElements();
        const matches = elements.filter(item => item.text.toLowerCase().includes(kw));
        searchDropdown.innerHTML = '';
        if (matches.length === 0) {
            searchDropdown.innerHTML = '<div class="hint">无匹配内容</div>';
        } else {
            const regex = new RegExp(`(${escapeRegExp(kw)})`, 'gi');
            matches.slice(0, 15).forEach(match => {
                const div = document.createElement('div');
                div.className = 'search-dropdown-item';
                let displayText = match.text;
                if (displayText.length > 60) {
                    const index = displayText.toLowerCase().indexOf(kw);
                    if (index > 30) displayText = '…' + displayText.substring(index - 20);
                    if (displayText.length > 60) displayText = displayText.substring(0, 60) + '…';
                }
                const highlightedText = displayText.replace(regex, '<strong>$1</strong>');
                div.innerHTML = highlightedText;
                div.addEventListener('click', function() {
                    markInstance.unmark();
                    markInstance.mark(rawKw, { element: 'mark', className: 'temp-highlight' });
                    match.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    match.element.classList.add('blink-highlight');
                    setTimeout(() => match.element.classList.remove('blink-highlight'), 1600);
                    searchDropdown.style.display = 'none';
                });
                searchDropdown.appendChild(div);
            });
        }
        searchDropdown.style.display = 'block';
    });

    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
            searchDropdown.style.display = 'none';
        }
    });

    const zoom1x = document.getElementById('zoom1x');
    const zoom2x = document.getElementById('zoom2x');
    if(zoom1x) zoom1x.addEventListener('click', () => document.documentElement.style.setProperty('--base-size', 1));
    if(zoom2x) zoom2x.addEventListener('click', () => document.documentElement.style.setProperty('--base-size', 1.5));

    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const rightContent = document.querySelector('.right-content');
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            rightContent.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const scrollLinks = document.querySelectorAll('.nav-items a[data-scroll]');

    scrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (!targetElement) return;

            const targetRect = targetElement.getBoundingClientRect();
            const rightRect = rightContent.getBoundingClientRect();
            const relativeTop = targetRect.top - rightRect.top + rightContent.scrollTop;

            rightContent.scrollTo({ top: relativeTop, behavior: 'smooth' });
            history.pushState(null, null, '#' + targetId);
        });
    });

    if (window.location.hash) {
        const id = window.location.hash.substring(1);
        const el = document.getElementById(id);
        if (el) {
            setTimeout(() => {
                const targetRect = el.getBoundingClientRect();
                const rightRect = rightContent.getBoundingClientRect();
                const relativeTop = targetRect.top - rightRect.top + rightContent.scrollTop;
                rightContent.scrollTo({ top: relativeTop, behavior: 'auto' });
            }, 100);
        }
    }

    function initChart(id, option) {
        const dom = document.getElementById(id);
        if (dom) echarts.init(dom).setOption(option);
    }

    initChart('demoPie', {
        tooltip: { trigger: 'item' },
        series: [{
            type: 'pie',
            radius: '55%',
            data: [
                { name: '结构', value: 45 },
                { name: '使用', value: 32 },
                { name: '自定义', value: 23 }
            ],
            label: { show: true, formatter: '{b}: {d}%' }
        }]
    });
})();