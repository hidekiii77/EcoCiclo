/* EcoCiclo — interações e validação do formulário */
(function () {
  "use strict";

  const body = document.body;

  // Preferência visual persistida localmente.
  const botaoTema = document.createElement("button");
  botaoTema.id = "botao-tema";
  botaoTema.type = "button";
  botaoTema.setAttribute("aria-pressed", "false");
  botaoTema.setAttribute("aria-label", "Ativar modo escuro");
  botaoTema.title = "Alternar modo claro/escuro";
  body.appendChild(botaoTema);

  function aplicarTema(escuro, salvar = false) {
    body.classList.toggle("modo-escuro", escuro);
    botaoTema.textContent = escuro ? "☀️" : "🌙";
    botaoTema.setAttribute("aria-pressed", String(escuro));
    botaoTema.setAttribute("aria-label", escuro ? "Ativar modo claro" : "Ativar modo escuro");
    if (salvar) {
      try { localStorage.setItem("ecociclo-tema", escuro ? "escuro" : "claro"); }
      catch (erro) { /* O site continua funcionando sem armazenamento local. */ }
    }
  }

  let temaSalvo = "claro";
  try { temaSalvo = localStorage.getItem("ecociclo-tema") || "claro"; }
  catch (erro) { /* Preferência padrão quando o armazenamento não está disponível. */ }
  aplicarTema(temaSalvo === "escuro");

  botaoTema.addEventListener("click", function () {
    aplicarTema(!body.classList.contains("modo-escuro"), true);
  });

  // Atalho para voltar ao topo.
  const botaoTopo = document.createElement("button");
  botaoTopo.id = "botao-topo";
  botaoTopo.type = "button";
  botaoTopo.textContent = "↑";
  botaoTopo.setAttribute("aria-label", "Voltar ao topo");
  botaoTopo.title = "Voltar ao topo";
  body.appendChild(botaoTopo);

  function atualizarBotaoTopo() {
    botaoTopo.classList.toggle("visivel", window.scrollY > 300);
  }
  window.addEventListener("scroll", atualizarBotaoTopo, { passive: true });
  atualizarBotaoTopo();
  botaoTopo.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Validação em JavaScript: não há servidor conectado para receber mensagens.
  document.querySelectorAll("form").forEach(function (form) {
    form.addEventListener("submit", function (evento) {
      evento.preventDefault();
      const resultado = form.querySelector('[role="status"], #resultado-formulario');
      let primeiroInvalido = null;
      let quantidadeErros = 0;

      form.querySelectorAll(".erro-campo").forEach(el => el.remove());
      form.querySelectorAll("input, textarea, select").forEach(function (campo) {
        campo.removeAttribute("aria-invalid");
        campo.classList.remove("campo-invalido");
        if (campo.disabled || ["submit", "button", "hidden"].includes(campo.type)) return;

        let mensagem = "";
        if (campo.required && campo.type === "checkbox" && !campo.checked) {
          mensagem = "Marque esta opção para continuar.";
        } else if (!campo.checkValidity()) {
          if (campo.validity.valueMissing) mensagem = "Este campo é obrigatório.";
          else if (campo.validity.typeMismatch && campo.type === "email") mensagem = "Digite um e-mail válido.";
          else if (campo.validity.tooShort) mensagem = `Digite pelo menos ${campo.minLength} caracteres.`;
          else if (campo.validity.patternMismatch) mensagem = "Confira o formato informado.";
          else if (campo.validity.rangeUnderflow || campo.validity.rangeOverflow) mensagem = "Informe um valor dentro do limite permitido.";
          else mensagem = "Confira este campo.";
        }

        if (mensagem) {
          quantidadeErros += 1;
          campo.setAttribute("aria-invalid", "true");
          campo.classList.add("campo-invalido");
          if (!primeiroInvalido) primeiroInvalido = campo;
          const aviso = document.createElement("span");
          aviso.className = "erro-campo";
          aviso.id = `${campo.id || campo.name}-erro`;
          aviso.textContent = mensagem;
          campo.insertAdjacentElement("afterend", aviso);
          const descricaoAtual = campo.getAttribute("aria-describedby");
          campo.setAttribute("aria-describedby", [descricaoAtual, aviso.id].filter(Boolean).join(" "));
        }
      });

      if (quantidadeErros > 0) {
        if (resultado) {
          resultado.textContent = `Foram encontrados ${quantidadeErros} campo(s) para corrigir. Revise os destaques.`;
          resultado.classList.add("mensagem-erro");
          resultado.classList.remove("mensagem-sucesso");
        }
        if (primeiroInvalido) primeiroInvalido.focus();
        return;
      }

      if (resultado) {
        resultado.textContent = "Validação concluída! Este formulário é demonstrativo e não envia os dados para um servidor.";
        resultado.classList.remove("mensagem-erro");
        resultado.classList.add("mensagem-sucesso");
      }
      form.reset();
    });

    form.querySelectorAll("input, textarea, select").forEach(function (campo) {
      campo.addEventListener("input", function () {
        if (campo.checkValidity()) {
          campo.removeAttribute("aria-invalid");
          campo.classList.remove("campo-invalido");
          const aviso = campo.nextElementSibling;
          if (aviso && aviso.classList.contains("erro-campo")) aviso.remove();
        }
      });
    });
  });
})();
