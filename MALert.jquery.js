let MAlertQueue = [];
let MAlertCounterID = 0;
let MAlertCurrentZIndex = 999999;

/**
 * MAlert(text, action, title)
 * - text: string obrigatório
 * - action: função opcional, executada ao fechar // string 'lock' para bloquear o botão de fechamento
 * - title: string opcional
 */
function MAlert(MAlertContent, action = null, title = '') {
	const lock = action === 'lock';
	const realAction = (!lock && typeof action === 'function') ? action : null;

	MAlertCounterID++;
	const alertId = `bs_alert_${MAlertCounterID}`;
	MAlertCurrentZIndex += 10;

	// Cria um novo elemento de alerta único
	const alertHTML = `
    <div id="${alertId}" style="margin:0; width:100%; height:100%; top:0; left:0; position: fixed; z-index: ${MAlertCurrentZIndex}; font-family: system-ui; background: rgba(0,0,0,0.3); opacity: 0; transition: opacity 200ms ease-out;">
      <div class="mAlertModal" style="font-size: 12px;box-shadow: 0 0 9999px 9999px #2121217a; background: #f7f7f7f7; max-width: 500px; width: 90%; padding: 20px; margin: 0; position: absolute; top: 45%; left: 50%; transform: translate(-50%, -50%) scale(0.7); text-align: center; color: black !important; border-radius: 4px; transition: transform 200ms ease-out;">
        
        <h2 style="margin: 0; font-weight: 600; font-size: 1.4em; color: #743ad5; display: ${title && title.trim() !== '' ? 'block' : 'none'};">${title || ''}</h2>

        <div style="text-align: center; margin: 10px 0; color: black !important;">${MAlertContent}</div>
        
        <button class="mAlertClose" style="width: 30px;height: 30px;border: none;font-size: 20px;position: absolute;top: 5px;color: #575757;right: 9px;cursor: pointer;background:transparent; display: ${lock ? 'none' : 'inline-block'};">x</button>
        
      </div>
    </div>
  `;

	// Adiciona o alerta ao body
	$('body').append(alertHTML);

	// Anima a entrada
	setTimeout(() => {
		$(`#${alertId}`).css('opacity', '1');
		$(`#${alertId} .mAlertModal`).css('transform', 'translate(-50%, -50%) scale(1)');
	}, 10);

	// Adiciona evento de clique no botão fechar
	$(`#${alertId} .mAlertClose`).on("click", function () {
		$(`#${alertId}`).css('opacity', '0');
		$(`#${alertId} .mAlertModal`).css('transform', 'translate(-50%, -50%) scale(0.7)');

		// Remove o elemento do DOM após a animação
		setTimeout(() => {
			$(`#${alertId}`).remove();
		}, 200);

		// Remove da fila
		MAlertQueue = MAlertQueue.filter(alert => alert.id !== alertId);

		// Executa a ação se houver
		if (typeof action === 'function') {
			action();
		}
	});

	// Adiciona à fila para controle
	MAlertQueue.push({
		id: alertId,
		action: realAction,
		lock: lock
	});
}



// Função para remover todos os alertas
function removeAllMAlerts() {
	MAlertQueue.forEach(alert => {
		// Anima a saída de cada alerta
		$(`#${alert.id}`).css('opacity', '0');
		$(`#${alert.id} .mAlertModal`).css('transform', 'translate(-50%, -50%) scale(0.7)');

		// Remove após a animação
		setTimeout(() => {
			$(`#${alert.id}`).remove();
		}, 200);
	});
	MAlertQueue = [];
}
