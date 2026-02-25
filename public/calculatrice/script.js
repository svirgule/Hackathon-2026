/**
 * ============================================
 * CALCULATRICE SIMPLE — Logique principale
 * ============================================
 * 
 * Architecture : un objet "state" centralise
 * l'état de la calculatrice. Chaque action
 * modifie ce state puis rafraîchit l'écran.
 * 
 * Concepts utilisés :
 *  - Événements délégués (event delegation)
 *  - Machine à états simple
 *  - Gestion du clavier
 */

// ── État de la calculatrice ──
const state = {
  current: '0',       // Ce qui est affiché en grand
  previous: '',       // Ce qui est affiché en petit (opération précédente)
  operator: null,     // L'opérateur en attente (+, -, *, /)
  operand: null,      // Le premier nombre de l'opération
  resetNext: false,   // Faut-il effacer l'écran au prochain chiffre ?
};

// ── Références DOM ──
const displayCurrent  = document.getElementById('current');
const displayPrevious = document.getElementById('previous');
const buttonsContainer = document.querySelector('.buttons');

// ══════════════════════════════════════════
// 1. FONCTIONS MÉTIER (la logique pure)
// ══════════════════════════════════════════

/**
 * Ajoute un chiffre ou un point à l'écran
 * @param {string} digit - Le caractère à ajouter ('0'-'9' ou '.')
 */
function inputDigit(digit) {
  // Empêcher plusieurs points
  if (digit === '.' && state.current.includes('.')) return;

  // Si on doit réinitialiser (après un = ou un opérateur)
  if (state.resetNext) {
    state.current = digit === '.' ? '0.' : digit;
    state.resetNext = false;
  } else {
    // Remplacer le 0 initial, sauf si on tape un point
    if (state.current === '0' && digit !== '.') {
      state.current = digit;
    } else {
      state.current += digit;
    }
  }
}

/**
 * Enregistre un opérateur et prépare le calcul
 * @param {string} op - L'opérateur (+, -, *, /)
 */
function inputOperator(op) {
  const currentValue = parseFloat(state.current);

  // Si on enchaîne les opérations sans appuyer sur =
  if (state.operator && !state.resetNext) {
    const result = calculate(state.operand, currentValue, state.operator);
    state.current = formatResult(result);
    state.operand = result;
  } else {
    state.operand = currentValue;
  }

  state.operator = op;
  state.resetNext = true;

  // Mettre à jour l'affichage de l'opération
  const opSymbol = { '/': '÷', '*': '×', '-': '−', '+': '+' };
  state.previous = `${formatResult(state.operand)} ${opSymbol[op] || op}`;
}

/**
 * Effectue le calcul entre deux nombres
 * @param {number} a - Premier opérande
 * @param {number} b - Second opérande
 * @param {string} op - L'opérateur
 * @returns {number} Le résultat
 */
function calculate(a, b, op) {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return b !== 0 ? a / b : NaN;
    default:  return b;
  }
}

/**
 * Formate un nombre pour l'affichage
 * - Limite les décimales à 10 chiffres
 * - Gère les erreurs (division par 0)
 * @param {number} num 
 * @returns {string}
 */
function formatResult(num) {
  if (isNaN(num) || !isFinite(num)) return 'Erreur';

  // Éviter les résultats trop longs (0.1 + 0.2 = 0.30000...)
  const rounded = parseFloat(num.toFixed(10));
  const str = rounded.toString();

  // Tronquer si trop long pour l'écran
  if (str.length > 15) {
    return num.toExponential(5);
  }

  return str;
}

/**
 * Exécute le calcul final (bouton =)
 */
function executeEquals() {
  if (state.operator === null) return;

  const currentValue = parseFloat(state.current);
  const result = calculate(state.operand, currentValue, state.operator);

  const opSymbol = { '/': '÷', '*': '×', '-': '−', '+': '+' };
  state.previous = `${formatResult(state.operand)} ${opSymbol[state.operator]} ${formatResult(currentValue)} =`;
  state.current = formatResult(result);
  state.operator = null;
  state.operand = null;
  state.resetNext = true;

  // Petit effet visuel
  flashResult();
}

/**
 * Remet tout à zéro
 */
function clearAll() {
  state.current = '0';
  state.previous = '';
  state.operator = null;
  state.operand = null;
  state.resetNext = false;
}

/**
 * Supprime le dernier caractère
 */
function backspace() {
  if (state.resetNext) return;
  state.current = state.current.length > 1
    ? state.current.slice(0, -1)
    : '0';
}

/**
 * Calcule le pourcentage
 */
function percent() {
  const value = parseFloat(state.current);
  state.current = formatResult(value / 100);
}

// ══════════════════════════════════════════
// 2. MISE À JOUR DE L'AFFICHAGE
// ══════════════════════════════════════════

function updateDisplay() {
  displayCurrent.textContent = state.current;
  displayPrevious.textContent = state.previous;
}

function flashResult() {
  displayCurrent.classList.add('flash');
  setTimeout(() => displayCurrent.classList.remove('flash'), 300);
}

// ══════════════════════════════════════════
// 3. GESTION DES ÉVÉNEMENTS
// ══════════════════════════════════════════

/**
 * Event delegation : un seul listener sur le conteneur
 * plutôt qu'un listener par bouton (meilleure performance)
 */
buttonsContainer.addEventListener('click', (e) => {
  const button = e.target.closest('.btn');
  if (!button) return;

  // Bouton chiffre ou point
  if (button.dataset.value && !button.classList.contains('btn-operator')) {
    inputDigit(button.dataset.value);
  }
  // Bouton opérateur
  else if (button.classList.contains('btn-operator')) {
    inputOperator(button.dataset.value);
  }
  // Boutons d'action
  else if (button.dataset.action) {
    switch (button.dataset.action) {
      case 'clear':     clearAll(); break;
      case 'backspace': backspace(); break;
      case 'percent':   percent(); break;
      case 'equals':    executeEquals(); break;
    }
  }

  updateDisplay();
});

/**
 * Support clavier — pour que ça marche même
 * quand l'iframe a le focus
 */
document.addEventListener('keydown', (e) => {
  const key = e.key;

  if (/^[0-9.]$/.test(key)) {
    inputDigit(key);
  } else if (['+', '-', '*', '/'].includes(key)) {
    inputOperator(key);
  } else if (key === 'Enter' || key === '=') {
    e.preventDefault();
    executeEquals();
  } else if (key === 'Backspace') {
    backspace();
  } else if (key === 'Escape' || key === 'c' || key === 'C') {
    clearAll();
  } else if (key === '%') {
    percent();
  } else {
    return; // Ne pas rafraîchir pour les touches non gérées
  }

  updateDisplay();
});

// ── Initialisation ──
updateDisplay();
console.log('Calculatrice Simple — Noeud chargé avec succès');