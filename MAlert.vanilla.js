/*! MALert - Simple JS Alerts | MIT — use freely, with or without modification. | Developed by: github.com/MTHS1901/MAlert-simple-js-alerts */

/**
 * Obtém o maior valor de z-index presente na página para garantir que 
 * o alerta seja sempre exibido acima de todos os outros elementos
 * @returns {number|null} O maior z-index encontrado ou null se nenhum for definido
 */
function getMaxZIndex() {
	let maxZIndex = -Infinity;
	
	// Percorre todos os elementos da página
	for (let element of document.querySelectorAll('*')) {
		let zIndex = window.getComputedStyle(element).zIndex;
		// Ignora valores 'auto' e converte para número
		if (zIndex !== 'auto') {
			maxZIndex = Math.max(maxZIndex, parseInt(zIndex));
		}
	}
	
	// Retorna null se nenhum z-index foi encontrado
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
 * @param {string} MAlertContent - Conteúdo HTML/texto do alerta (obrigatório)
 * @param {function|string} action - Função executada ao fechar ou 'lock' para bloquear fechamento (opcional)
 * @param {string} title - Título do alerta (opcional)
 */
function MAlert(MAlertContent, action = null, title = '') {
	// Verifica se o alerta deve ser bloqueado (não pode ser fechado)
	const lock = action === 'lock';
	
	// Define a ação real apenas se for uma função válida e não estiver bloqueado
	const realAction = (!lock && typeof action === 'function') ? action : null;

	// Gera ID único para este alerta
	MAlertCounterID++;
	const alertId = `MAlert${MAlertCounterID}`;
	
	// Define z-index sempre acima de outros elementos
	MAlertCurrentZIndex = getMaxZIndex() + 1;

	// Gera ID único para o CSS da scrollbar (evita duplicação)
	const ranid = 'scroll-' + Math.random().toString(36).substr(2, 9);
	
	// Adiciona estilos CSS para scrollbar personalizada (apenas uma vez)
	if (!document.getElementById(ranid)) {
		const scrollbarCSS = `
/* Estilização da scrollbar para o conteúdo do modal */
.mAlertModal div::-webkit-scrollbar {
    width: 8px;
}

.mAlertModal div::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 4px;
    margin: 4px 0;
}

.mAlertModal div::-webkit-scrollbar-thumb {
    background: gray;
    border-radius: 4px;
    transition: background 0.3s ease;
}

.mAlertModal div::-webkit-scrollbar-thumb:hover {
    background: gray;
}

.mAlertModal div::-webkit-scrollbar-thumb:active {
    background: gray;
}
        `;
		
		const styleElement = document.createElement('style');
		styleElement.id = ranid;
		styleElement.textContent = scrollbarCSS;
		document.head.appendChild(styleElement);
	}

	// Template HTML do modal de alerta
	const alertHTML = `
        <div id="${alertId}" style="margin:0; width:100%; height:100%; top:0; left:0; position: fixed; z-index: ${MAlertCurrentZIndex}; font-family: system-ui; background: rgba(0,0,0,0.3); opacity: 0; transition: opacity 100ms ease-out;">
            <!-- Container principal do modal -->
            <div class="mAlertModal" style="font-size: 14px; box-shadow: 0 0 9999px 9999px #2121217a; background: #f7f7f7f7; max-width: 500px; width: 90%; max-height: 80vh; padding: 20px; margin: 0; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(1); text-align: center; color: black !important; border-radius: 4px; transition: transform 200ms ease-out; display: flex; flex-direction: column;">
                
                <!-- Título do alerta (exibido apenas se fornecido) -->
                <h2 style="margin: 0; font-weight: 600; font-size: 1.4em; color: #743ad5; display: ${title && title.trim() !== '' ? 'block' : 'none'}; flex-shrink: 0;">${title || ''}</h2>

                <!-- Área de conteúdo com scroll automático -->
                <div class="malert-content" style="text-align: center; margin: 10px 0; color: black !important; overflow-y: auto; max-height: calc(80vh - 100px); flex-grow: 1; padding-right: 4px;">
                    <div>${MAlertContent}</div>
                </div>
                
                <!-- Botão de fechar (oculto quando lock=true) -->
                <button class="mAlertClose" style="width: 30px; height: 30px; border: none; font-size: 20px; position: absolute; top: 5px; color: #575757; right: 9px; cursor: pointer; background: transparent; display: ${lock ? 'none' : 'inline-block'}; z-index: 1;">×</button>
                
            </div>
        </div>
    `;

	// Adiciona o alerta ao final do body
	document.body.insertAdjacentHTML('afterend', alertHTML);

	// Referência ao elemento criado
	const alertElement = document.getElementById(alertId);
	const modalElement = alertElement.querySelector('.mAlertModal');

	// Animação de entrada do modal (fade in + scale)
	setTimeout(() => {
		alertElement.style.opacity = '1';
		modalElement.style.transform = 'translate(-50%, -50%) scale(1)';
	}, 10);

	// Event listener para o botão de fechar
	const closeButton = alertElement.querySelector('.mAlertClose');
	if (closeButton) {
		closeButton.addEventListener('click', function() {
			// Animação de saída (fade out + scale down)
			alertElement.style.opacity = '0';
			modalElement.style.transform = 'translate(-50%, -50%) scale(0.7)';

			// Remove o elemento do DOM após a animação completar
			setTimeout(() => {
				if (alertElement.parentNode) {
					alertElement.parentNode.removeChild(alertElement);
				}
			}, 200);

			// Remove o alerta da fila de controle
			MAlertQueue = MAlertQueue.filter(alert => alert.id !== alertId);

			// Executa a função de callback se fornecida
			if (typeof action === 'function') {
				action();
			}
		});
	}

	// Adiciona o alerta à fila para controle e gerenciamento
	MAlertQueue.push({
		id: alertId,
		action: realAction,
		lock: lock
	});
}

/**
 * Remove todos os alertas ativos da tela
 * Aplica animação de saída antes de remover do DOM
 */
function removeAllMAlerts() {
	// Percorre todos os alertas na fila
	MAlertQueue.forEach(alert => {
		const alertElement = document.getElementById(alert.id);
		if (alertElement) {
			const modalElement = alertElement.querySelector('.mAlertModal');
			
			// Aplica animação de saída para cada alerta
			alertElement.style.opacity = '0';
			if (modalElement) {
				modalElement.style.transform = 'translate(-50%, -50%) scale(0.7)';
			}

			// Remove do DOM após a animação
			setTimeout(() => {
				if (alertElement.parentNode) {
					alertElement.parentNode.removeChild(alertElement);
				}
			}, 200);
		}
	});
	
	// Limpa a fila de alertas
	MAlertQueue = [];
}
