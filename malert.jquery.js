/*! MALert - Simple JS Alerts | MIT — use freely, with or without modification. | Developed by: github.com/MTHS1901/MAlert-simple-js-alerts */

/*
 * Obtém o maior valor de z-index presente na página para garantir que 
 * o alerta seja sempre exibido acima de todos os outros elementos
 * @returns {number|null} O maior z-index encontrado ou null se nenhum for definido
 */
function getMaxZIndex() {
	let maxZIndex = -Infinity;
	for (let element of document.querySelectorAll('*')) {
		let zIndex = window.getComputedStyle(element).zIndex;
		if (zIndex !== 'auto') {
			maxZIndex = Math.max(maxZIndex, parseInt(zIndex));
		}
	}
	return maxZIndex === -Infinity ? null : maxZIndex;
}

// Fila para controlar múltiplos alertas ativos
let MAlertQueue = [];

// Contador para gerar IDs únicos para cada alerta
let MAlertCounterID = 0;

// Armazena o z-index atual usado pelos alertas
let MAlertCurrentZIndex = 0;

/**
 * Cria e exibe um alerta modal customizado
 * @param {object} options - Objeto com configurações do alerta
 * @param {string} options.title        - Título do alerta (opcional)
 * @param {string} options.body         - Conteúdo do alerta
 * @param {string} options.id           - ID customizado para o alerta (opcional)
 * @param {string} options.titleColor   - Cor do título (opcional, padrão: '#743ad5')
 * @param {object} options.buttons      - Objeto com botões customizados (opcional)
 *   Formato: { chave: { text, color, textColor, action } }
 *   - action() retornando false mantém o alerta aberto
 * @param {function} options.onClose    - Função executada ao fechar pelo X (opcional)
 * @param {boolean} options.hideClose   - Se true, oculta o botão X permanentemente (opcional)
 * @param {number}  options.closeDelay  - Segundos para liberar o botão X (opcional)
 *   Enquanto conta, o X fica desabilitado e exibe o tempo restante
 */
function MAlert(options = {}) {
	if (typeof options !== 'object' || options === null) {
		console.error('MAlert: O parâmetro deve ser um objeto com as configurações');
		return;
	}

	const MAlertContent = options.body        || '';
	const alertTitle    = options.title       || '';
	const callback      = typeof options.onClose === 'function' ? options.onClose : null;
	const hideClose     = options.hideClose   === true;
	const titleColor    = options.titleColor  || "#333";
	const closeDelay    = (typeof options.closeDelay === 'number' && options.closeDelay > 0)
	                        ? Math.ceil(options.closeDelay) : 0;
	const buttons       = (typeof options.buttons === 'object' && options.buttons !== null && !Array.isArray(options.buttons))
	                        ? options.buttons : null;

	// ID customizado ou gerado automaticamente
	MAlertCounterID++;
	const customId = options.id || null;
	const alertId  = customId || `MAlert${MAlertCounterID}`;

	if (MAlertQueue.some(a => a.id === alertId)) {
		console.warn(`MAlert: Já existe um alerta com o ID "${alertId}"`);
		return;
	}

	MAlertCurrentZIndex = getMaxZIndex() + 1;

	// Injeta CSS da scrollbar e do botão X com contador (apenas uma vez)
	if (!document.getElementById('MAlertGlobalStyles')) {
		const globalCSS = `
<style id="MAlertGlobalStyles">
.mAlertModal div::-webkit-scrollbar { width: 8px; }
.mAlertModal div::-webkit-scrollbar-track { background: transparent; border-radius: 4px; margin: 4px 0; }
.mAlertModal div::-webkit-scrollbar-thumb { background: gray; border-radius: 4px; }
.mAlertModal div::-webkit-scrollbar-thumb:hover { background: gray; }

.mAlertClose {
	width: 30px; height: 30px; border: none; padding: 0;
	position: absolute; top: 8px; right: 8px;
	cursor: pointer; background: transparent;
	display: flex; align-items: center; justify-content: center;
	z-index: 1; transition: opacity 0.2s;
}
.mAlertClose:disabled {
	cursor: default;
	opacity: 0.5;
}
.mAlertClose .malert-close-counter {
	font-size: 13px;
	font-weight: 600;
	color: #575757;
	font-family: system-ui;
	line-height: 1;
}
.malert-btn {
	padding: 8px 22px; border: none; border-radius: 4px;
	font-size: 14px; font-family: system-ui; cursor: pointer;
	transition: opacity 0.15s ease;
}
.malert-btn:hover  { opacity: 0.8; }
.malert-btn:active { opacity: 0.6; }
</style>`;
		$('head').append(globalCSS);
	}

	// ── Botões customizados ──────────────────────────────────────────────────
	let buttonsHTML = '';
	if (buttons) {
		buttonsHTML = `<div class="malert-buttons" style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:10px;flex-shrink:0;">`;
		Object.keys(buttons).forEach(key => {
			const btn      = buttons[key];
			const btnText  = btn.text  || key;
			const btnStyle = btn.style || 'background:#743ad5;color:#fff;';
			buttonsHTML += `<button class="malert-btn" data-malert-btn="${key}" style="${btnStyle}">${btnText}</button>`;
		});
		buttonsHTML += `</div>`;
	}

	// ── Botão X: ícone SVG ou contador ──────────────────────────────────────
	const closeBtnInner = closeDelay > 0
		? `<span class="malert-close-counter">${closeDelay}</span>`
		: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
		        stroke="#575757" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
		     <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
		   </svg>`;

	const closeBtnDisabled = closeDelay > 0 ? 'disabled' : '';

	// ── Template HTML ────────────────────────────────────────────────────────
	const alertHTML = `
<div id="${alertId}" style="margin:0;width:100%;height:100%;top:0;left:0;position:fixed;z-index:${MAlertCurrentZIndex};font-family:system-ui;background:rgba(0,0,0,0.3);opacity:0;transition:opacity 100ms ease-out;">
    <div class="mAlertModal" style="font-size:14px;box-shadow:0 0 9999px 9999px #2121217a;background:#f7f7f7f7;max-width:500px;width:90%;max-height:80vh;padding:20px;margin:0;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) scale(1);text-align:center;color:black !important;border-radius:4px;transition:transform 200ms ease-out;display:flex;flex-direction:column;">

        <h2 style="margin:0;font-weight:600;font-size:1.4em;color:${titleColor};display:${alertTitle.trim() !== '' ? 'block' : 'none'};flex-shrink:0;">${alertTitle}</h2>

        <div class="malert-content" style="text-align:center;margin:10px 0;color:black !important;overflow-y:auto;max-height:calc(80vh - 100px);flex-grow:1;padding-right:4px;">
            <div>${MAlertContent}</div>
        </div>

        ${buttonsHTML}

        <button class="mAlertClose" ${closeBtnDisabled} style="display:${hideClose ? 'none' : 'flex'};">
            ${closeBtnInner}
        </button>
    </div>
</div>`;

	$('body').after(alertHTML);

	// ── Funções internas ─────────────────────────────────────────────────────
	function closeThisAlert() {
		$(`#${alertId}`).css('opacity', '0');
		$(`#${alertId} .mAlertModal`).css('transform', 'translate(-50%, -50%) scale(0.7)');
		setTimeout(() => $(`#${alertId}`).remove(), 200);
		MAlertQueue = MAlertQueue.filter(a => a.id !== alertId);
	}

	// Animação de entrada
	setTimeout(() => {
		$(`#${alertId}`).css('opacity', '1');
		$(`#${alertId} .mAlertModal`).css('transform', 'translate(-50%, -50%) scale(1)');
	}, 10);

	// ── Contador regressivo para liberar o X ─────────────────────────────────
	if (closeDelay > 0 && !hideClose) {
		let remaining = closeDelay;
		const interval = setInterval(() => {
			remaining--;
			const $btn     = $(`#${alertId} .mAlertClose`);
			const $counter = $btn.find('.malert-close-counter');

			if (remaining <= 0) {
				clearInterval(interval);
				// Troca o número pelo ícone SVG e habilita o botão
				$counter.replaceWith(`
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
					     fill="none" stroke="#575757" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
					  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
					</svg>`);
				$btn.prop('disabled', false).css('opacity', '1');
			} else {
				$counter.text(remaining);
			}
		}, 1000);

		// Garante que o interval é limpo se o alerta for fechado por outro meio
		MAlertQueue.push({ id: alertId, action: callback, hideClose, _interval: interval });
	} else {
		MAlertQueue.push({ id: alertId, action: callback, hideClose });
	}

	// ── Evento do botão X ────────────────────────────────────────────────────
	$(`#${alertId} .mAlertClose`).on('click', function () {
		if ($(this).prop('disabled')) return;
		_clearAlertInterval(alertId);
		closeThisAlert();
		if (typeof callback === 'function') callback();
	});

	// ── Eventos dos botões customizados ──────────────────────────────────────
	if (buttons) {
		$(`#${alertId} .malert-btn`).on('click', function () {
			const btnKey = $(this).data('malert-btn');
			const btn    = buttons[btnKey];
			if (typeof btn.action === 'function') {
				let closed = false;
				const closeIt = () => {
					if (closed) return;
					closed = true;
					_clearAlertInterval(alertId);
					closeThisAlert();
				};
				const result = btn.action(closeIt);
				// return false → mantém aberto (controle manual via closeIt)
				if (result === false) return;
				// sem return false e closeIt não chamado → fecha automaticamente
				if (!closed) closeIt();
			} else {
				_clearAlertInterval(alertId);
				closeThisAlert();
			}
		});
	}
}

/** Limpa o interval de countdown de um alerta (uso interno) */
function _clearAlertInterval(id) {
	const entry = MAlertQueue.find(a => a.id === id);
	if (entry && entry._interval) {
		clearInterval(entry._interval);
	}
}

/**
 * Remove um alerta específico pelo seu ID
 * @param {string} id - O ID do alerta a ser removido
 */
function removeMAlert(id) {
	const entry = MAlertQueue.find(a => a.id === id);
	if (!entry) {
		console.warn(`MAlert: Nenhum alerta encontrado com o ID "${id}"`);
		return;
	}

	_clearAlertInterval(id);

	$(`#${id}`).css('opacity', '0');
	$(`#${id} .mAlertModal`).css('transform', 'translate(-50%, -50%) scale(0.7)');
	setTimeout(() => $(`#${id}`).remove(), 200);

	if (typeof entry.action === 'function') entry.action();

	MAlertQueue = MAlertQueue.filter(a => a.id !== id);
}

/**
 * Remove todos os alertas ativos da tela
 */
function removeAllMAlerts() {
	MAlertQueue.forEach(alert => {
		if (alert._interval) clearInterval(alert._interval);
		$(`#${alert.id}`).css('opacity', '0');
		$(`#${alert.id} .mAlertModal`).css('transform', 'translate(-50%, -50%) scale(0.7)');
		setTimeout(() => $(`#${alert.id}`).remove(), 200);
	});
	MAlertQueue = [];
}

window.malert          = MAlert;
window.removemalert    = removeMAlert;
window.removeallmalerts= removeAllMAlerts;
