# MAlert — Versões jQuery e Vanilla
Após enfrentar alguns problemas com a charmosa (e problemática) biblioteca `jquery-confirm` — especialmente ao integrá-la em páginas com certas restrições — decidi criar meu próprio sistema de alerta personalizado. Desenvolvi uma solução simples para atender minha necessidade. Resolvi compartilhar aqui, caso também possa ajudar outras pessoas.

## 📦 Instalação
### Versão jQuery
Inclua o jQuery e o script da biblioteca no seu HTML:
```html
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="MAlert.jquery.js"></script>
```
### Versão Vanilla (sem jQuery)
```html
<script src="MAlert.vanilla.js"></script>
```

## ⚡ Exemplos de uso

### Uso com objeto de configuração (recomendado)
```javascript
// Alerta simples
MAlert({
    body: "Texto do alerta"
});

// Alerta com título
MAlert({
    title: "Sou um título 👑",
    body: "Texto do alerta"
});

// Alerta com ação após fechamento
MAlert({
    title: "Sou um título 👑",
    body: "Se me fechar, vou redirecionar para o Google",
    onClose: function() {
        location.href = 'https://google.com';
    }
});

// Alerta sem botão de fechar
MAlert({
    title: "Sou um título 👑",
    body: "Sou um alerta que não pode ser fechado",
    hideClose: true
});
```

### Uso com parâmetros diretos (compatibilidade com versões anteriores)
```javascript
// Alerta simples com botão "X" para fechar
MAlert("Texto do alerta");

// Alerta com título (passe null para a função caso não tenha callback)
MAlert("Texto do alerta", null, "Sou um título 👑");

// Alerta com título e ação após o fechamento
MAlert("Se me fechar, vou redirecionar para o Google", function() {
    location.href = 'https://google.com';
}, "Sou um título 👑");

// Alerta que remove o botão x (passe "lock" no lugar da função)
MAlert("Sou um alerta que não pode ser fechado", "lock", "Sou um título 👑");
```

### Remover todos os alertas da tela
```javascript
removeAllMAlerts();
```

## 🧪 Demonstração
Você pode ver uma demonstração ao vivo [aqui](#) (DEPOIS)

## ⚙️ Como funciona
- Cada alerta é empilhado na tela com `z-index` crescente.
- O botão "X" fecha o alerta e executa a função de callback `onClose` (caso fornecida).
- O método `removeAllMAlerts()` remove todos os alertas ativos de uma vez.

## 📋 Parâmetros de configuração

| Parâmetro | Tipo | Descrição | Padrão |
|-----------|------|-----------|--------|
| `title` | string | Título do alerta (opcional) | - |
| `body` | string | Conteúdo principal do alerta | - |
| `onClose` | function | Função executada ao fechar o alerta | null |
| `hideClose` | boolean | Se `true`, oculta o botão de fechar | false |

## 📄 Licença
MIT — use livremente, com ou sem modificações.
