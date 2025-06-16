let bsAlertFila = [];
let alertIdCounter = 0;
let currentZIndex = 999999;

function mAlertNow(mensagem, action = null, title = '') {
  const lock = action === 'lock';
  const realAction = (!lock && typeof action === 'function') ? action : null;

  alertIdCounter++;
  const alertId = `bs_alert_${alertIdCounter}`;
  currentZIndex += 10;

  const alertDiv = document.createElement('div');
  alertDiv.id = alertId;
  alertDiv.style.cssText = `
    margin:0; width:100%; height:100%; top:0; left:0;
    position: fixed; z-index: ${currentZIndex};
    font-family: system-ui;
    background: rgba(0,0,0,0.3);
    opacity: 0;
    transition: opacity 200ms ease-out;
  `;

  const modal = document.createElement('div');
  modal.className = 'mAlertModal';
  modal.style.cssText = `
    font-size: 12px;
    box-shadow: 0 0 9999px 9999px #2121217a;
    background: #f7f7f7f7;
    max-width: 500px;
    width: 90%;
    padding: 20px;
    margin: 0;
    position: absolute;
    top: 45%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.7);
    text-align: center;
    color: black !important;
    border-radius: 4px;
    transition: transform 200ms ease-out;
  `;

  if (title && title.trim() !== '') {
    const h2 = document.createElement('h2');
    h2.style.cssText = `
      margin: 0;
      font-weight: 600;
      font-size: 1.4em;
      color: #743ad5;
    `;
    h2.textContent = title;
    modal.appendChild(h2);
  }

  const msg = document.createElement('div');
  msg.style.cssText = `text-align: center; margin: 10px 0; color: black !important;`;
  msg.innerHTML = mensagem;
  modal.appendChild(msg);

  if (!lock) {
    const closeBtn = document.createElement('button');
    closeBtn.className = 'mAlertClose';
    closeBtn.innerHTML = 'x';
    closeBtn.style.cssText = `
      width: 30px;
      height: 30px;
      border: none;
      font-size: 20px;
      position: absolute;
      top: 5px;
      color: #575757;
      right: 9px;
      cursor: pointer;
      background: transparent;
    `;
    closeBtn.onclick = () => removeLastMAlert(alertId, realAction);
    modal.appendChild(closeBtn);
  }

  alertDiv.appendChild(modal);
  document.body.appendChild(alertDiv);

  // Trigger animation
  setTimeout(() => {
    alertDiv.style.opacity = '1';
    modal.style.transform = 'translate(-50%, -50%) scale(1)';
  }, 10);

  bsAlertFila.push({
    id: alertId,
    action: realAction,
    lock: lock
  });
}

function removeLastMAlert(alertId, action = null) {
  const alertEl = document.getElementById(alertId);
  if (!alertEl) return;

  const modal = alertEl.querySelector('.mAlertModal');
  alertEl.style.opacity = '0';
  modal.style.transform = 'translate(-50%, -50%) scale(0.7)';

  setTimeout(() => {
    if (alertEl && alertEl.parentNode) {
      alertEl.parentNode.removeChild(alertEl);
    }
  }, 200);

  bsAlertFila = bsAlertFila.filter(alert => alert.id !== alertId);

  if (typeof action === 'function') {
    action();
  }
}

function removeAllMAlerts() {
  bsAlertFila.forEach(alert => {
    const alertEl = document.getElementById(alert.id);
    if (!alertEl) return;
    const modal = alertEl.querySelector('.mAlertModal');
    alertEl.style.opacity = '0';
    modal.style.transform = 'translate(-50%, -50%) scale(0.7)';
    setTimeout(() => {
      if (alertEl.parentNode) {
        alertEl.parentNode.removeChild(alertEl);
      }
    }, 200);
  });
  bsAlertFila = [];
}
