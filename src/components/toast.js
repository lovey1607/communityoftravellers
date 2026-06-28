// ============================================
// Toast Notification System
// ============================================

import { store } from '../state.js';

export function initToasts() {
    store.on('toasts', renderToasts);
}

function renderToasts(toasts) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    container.innerHTML = toasts.map(toast => `
        <div class="toast toast-${toast.type}" id="toast-${toast.id}" data-toast-id="${toast.id}">
            <span class="toast-icon material-icons-round">${getToastIcon(toast.type)}</span>
            <span class="toast-message">${toast.message}</span>
            <button class="toast-close" onclick="this.closest('.toast').remove()" aria-label="Close">
                <span class="material-icons-round" style="font-size:16px">close</span>
            </button>
        </div>
    `).join('');
}

function getToastIcon(type) {
    switch (type) {
        case 'success': return 'check_circle';
        case 'error': return 'error';
        case 'warning': return 'warning';
        default: return 'info';
    }
}

// ============================================
// Modal System
// ============================================

export function showModal({ title, content, actions = [], size = 'md', onClose }) {
    const root = document.getElementById('modal-root');
    if (!root) return;

    const sizeClass = `modal-${size}`;

    root.innerHTML = `
        <div class="modal-backdrop" id="modal-backdrop">
            <div class="modal-content ${sizeClass}" role="dialog" aria-labelledby="modal-title" aria-modal="true">
                <div class="modal-header">
                    <h3 id="modal-title">${title}</h3>
                    <button class="btn btn-icon btn-ghost modal-close-btn" id="modal-close" aria-label="Close modal">
                        <span class="material-icons-round">close</span>
                    </button>
                </div>
                <div class="modal-body">${content}</div>
                ${actions.length > 0 ? `
                    <div class="modal-footer">
                        ${actions.map(a => `
                            <button class="btn ${a.className || 'btn-ghost'}" id="${a.id || ''}">${a.label}</button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    const closeModal = () => {
        const backdrop = document.getElementById('modal-backdrop');
        if (backdrop) {
            backdrop.classList.remove('active');
            setTimeout(() => {
                root.innerHTML = '';
                document.body.style.overflow = '';
                onClose?.();
            }, 250); // Matches transition duration
        } else {
            root.innerHTML = '';
            document.body.style.overflow = '';
            onClose?.();
        }
    };

    document.body.style.overflow = 'hidden';
    
    // Add active class in next frame to trigger fade-in transition
    requestAnimationFrame(() => {
        document.getElementById('modal-backdrop')?.classList.add('active');
    });

    document.getElementById('modal-close')?.addEventListener('click', closeModal);
    document.getElementById('modal-backdrop')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeModal();
    });
    document.addEventListener('keydown', function handler(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handler);
        }
    });

    // Bind action handlers
    actions.forEach(a => {
        if (a.id && a.onClick) {
            document.getElementById(a.id)?.addEventListener('click', () => {
                a.onClick();
                if (a.closeOnClick !== false) closeModal();
            });
        }
    });

    return closeModal;
}

export function closeModal() {
    const root = document.getElementById('modal-root');
    if (!root) return;
    const backdrop = document.getElementById('modal-backdrop');
    if (backdrop) {
        backdrop.classList.remove('active');
        setTimeout(() => {
            root.innerHTML = '';
            document.body.style.overflow = '';
        }, 250);
    } else {
        root.innerHTML = '';
        document.body.style.overflow = '';
    }
}
