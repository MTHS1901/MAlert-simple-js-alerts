# MAlert — Versões jQuery e Vanilla
Após enfrentar alguns problemas com a charmosa (e problemática) biblioteca `jquery-confirm` — especialmente ao integrá-la em páginas com certas restrições — decidi criar meu próprio sistema de alerta personalizado. Desenvolvi uma solução simples para atender minha necessidade. Resolvi compartilhar aqui, caso também possa ajudar outras pessoas.

## 📦 Instalação

### Versão jQuery

Inclua o jQuery e o script da biblioteca no seu HTML:

```html
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="MAlert.jquery.min.js"></script>
```

### Versão Vanilla (sem jQuery)

```html
<script src="MAlert.vanilla.min.js"></script>
```

## ⚡ Exemplos de uso

### Alerta simples com botão "X" para fechar

```javascript
MAlert("Texto do alerta");
/* ou inclua um titulo, passe o parametro null para a função (caso não tenha função) */
MAlert("Texto do alerta", null, "Sou um título 👑");
```

### Alerta com título e ação após o fechamento

```javascript
MAlert("Se me fechar, vou redirecionar para o Google",function() { location.href = 'https://google.com'; },"Sou um título 👑");
```

### Alerta que remove o botão x, no lugar da função passe a string "lock"

```javascript
MAlert("Sou um alerta que não pode ser fechado", "lock", "Sou um título 👑");
```


### Remover todos os alertas da tela

```javascript
removeAllMAlerts();
```

## 🧪 Demonstração

Você pode ver uma demonstração ao vivo [aqui](#) 

## ⚙️ Como funciona

- Cada alerta é empilhado na tela com `z-index` crescente.
- O botão "X" fecha o alerta e executa a função (caso fornecida).
- O método `removeAllMAlerts()` remove todos os alertas ativos de uma vez.

## 📄 Licença

MIT — use livremente, com ou sem modificações.
