# Minha Trilha de Estudos

Uma aplicação web para organizar cursos livres, capacitações e trilhas de aprendizagem. Funciona 100% no lado do cliente (client-side), sem necessidade de banco de dados externo ou autenticação, garantindo a privacidade dos seus dados usando o armazenamento local do seu navegador (`LocalStorage`).

## 🚀 Funcionalidades

- **Dashboard:** Visão geral do progresso, horas de estudo, próximo prazo e atalho para continuar estudando.
- **Catálogo de Cursos:** Gerenciamento completo (CRUD) de cursos com suporte a categorias, instituições, status e progresso.
- **Meu Cronograma:** Configuração de dias e horários de estudo. Exportação de eventos em formato `.ics` para Google Calendar, Outlook e Apple Calendar.
- **Anotações:** Bloco de notas para cada curso, exportável em Markdown.
- **Privacidade e Backup:** Seus dados ficam salvos apenas no seu navegador. É possível exportar (backup) e importar os dados em JSON.
- **Tema:** Suporte a modo Claro e Escuro.
- **Acessibilidade:** Desenvolvido pensando na usabilidade por teclado e bom contraste.

## 🛠️ Tecnologias Utilizadas

- HTML5 Semântico
- CSS3 (Variáveis, Flexbox, Grid, Responsividade)
- JavaScript Vanilla (ES6+)
- LocalStorage para persistência de dados
- [Lucide Icons](https://lucide.dev/) (Ícones em SVG)

## 📦 Como Usar

### Executando Localmente

A aplicação não requer um servidor web complexo. Por ser construída com JS puro e LocalStorage, você pode simplesmente:

1. Fazer o download ou clonar este repositório:
   ```bash
   git clone https://github.com/seu-usuario/minha-trilha-de-estudos.git
   ```
2. Abrir o arquivo `index.html` em qualquer navegador moderno (Chrome, Firefox, Edge, Safari).

*Dica:* Para usar como aplicativo no celular ou desktop, você pode usar a função "Instalar" ou "Adicionar à Tela Inicial" em navegadores que suportam PWA/Atalhos de sites.

### Publicando no GitHub Pages

Este projeto está pronto para ser hospedado no GitHub Pages.

1. Faça o Fork ou clone este repositório para o seu GitHub.
2. Acesse as **Settings** (Configurações) do seu repositório.
3. No menu lateral esquerdo, clique em **Pages**.
4. Em "Build and deployment", selecione a branch `main` e a pasta `/ (root)`.
5. Salve. O GitHub fornecerá um link (ex: `https://seu-usuario.github.io/minha-trilha-de-estudos`).

## ⚙️ Como Configurar Novos Cursos

Ao abrir a aplicação pela primeira vez, você pode escolher começar com a Trilha Demonstrativa (focada em Skincare e Cosmetologia) ou começar do zero.
- Para adicionar novos, vá em **Cursos > Novo Curso**.
- Cole o link externo do curso na seção URL.
- O aplicativo funciona como um organizador de referências, ele **não** hospeda nem reproduz o conteúdo dos cursos de terceiros.

## 💾 Importação, Exportação e Limitações

- **Backup:** Como os dados ficam no LocalStorage do navegador, **eles podem ser perdidos se você limpar o cache/dados do navegador ou usar o modo anônimo**. 
- Recomenda-se ir regularmente em **Configurações > Fazer Backup** para baixar seu arquivo `.json`.
- Para trocar de computador ou navegador, faça o backup em um e importe no outro.

## 📄 Licença

Este projeto é licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Como Contribuir

1. Faça um Fork do projeto
2. Crie uma Branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Faça o Commit de suas mudanças (`git commit -m 'Adiciona NovaFuncionalidade'`)
4. Faça o Push para a Branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

---
*Nota: Esta é uma ferramenta independente e open source. Não possui nenhum vínculo oficial com as instituições de ensino listadas na trilha de exemplo.*
