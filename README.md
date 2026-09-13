<div align="center">

# 🏛️ Cidadania na Escola

### Informação de qualidade. Cidadania mais forte.

Projeto de extensão universitária voltado à educação para a cidadania, democracia, combate à desinformação e conhecimento sobre direitos trabalhistas.

<br>

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Projeto](https://img.shields.io/badge/projeto-extensão%20universitária-153E79)
![Angular](https://img.shields.io/badge/Angular-DD0031?logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Django](https://img.shields.io/badge/Django-092E20?logo=django&logoColor=white)
![Django REST](https://img.shields.io/badge/Django%20REST%20Framework-A30000?logo=django&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)

</div>

---

## 📚 Sobre o projeto

**Cidadania na Escola: informação de qualidade também é conquista** é um projeto de extensão universitária desenvolvido com o objetivo de aproximar conhecimentos relacionados à **cidadania, democracia, combate à desinformação e direitos trabalhistas** da comunidade escolar.

A proposta busca utilizar a tecnologia como ferramenta de educação e conscientização, disponibilizando conteúdos de forma simples, acessível e organizada.

O projeto também possui como público importante os estudantes da **Educação de Jovens e Adultos (EJA)**, buscando contribuir para o acesso à informação de qualidade e para o conhecimento sobre direitos e deveres na sociedade.

---

## 🎯 Objetivos

### Objetivo geral

Desenvolver uma plataforma educativa que contribua para a formação cidadã por meio do acesso a informações confiáveis sobre democracia, cidadania, desinformação e direitos trabalhistas.

### Objetivos específicos

- 📖 Disponibilizar conteúdos educativos sobre cidadania;
- 🏛️ Explicar conceitos relacionados à democracia;
- 🔎 Incentivar a verificação de informações;
- 📰 Conscientizar sobre os impactos da desinformação e das fake news;
- ⚖️ Apresentar informações introdutórias sobre direitos trabalhistas;
- 🧠 Criar atividades interativas para auxiliar no aprendizado;
- 💻 Utilizar a tecnologia como ferramenta de educação;
- 🤝 Contribuir para a formação cidadã dos estudantes da EJA.

---

# 🌐 Plataforma

A plataforma será desenvolvida como uma aplicação web, permitindo que os usuários encontrem conteúdos educativos organizados por temas.

### Principais áreas planejadas

| Área | Descrição |
|---|---|
| 🏠 Início | Apresentação do projeto e principais conteúdos |
| 🏛️ Democracia | Conteúdos sobre democracia e participação cidadã |
| 📰 Desinformação | Informações sobre fake news e seus impactos |
| 🔎 Checagem | Orientações para verificar informações |
| ⚖️ Direitos Trabalhistas | Conteúdos introdutórios sobre legislação trabalhista |
| 🧠 Quiz | Atividades para testar os conhecimentos |
| 📚 Materiais | Materiais educativos e conteúdos complementares |
| 👥 Sobre | Informações sobre o projeto e participantes |

---

# 💡 Proposta

A ideia principal é transformar conteúdos que podem parecer complexos em informações mais simples e acessíveis.

A plataforma poderá apresentar:

- Textos explicativos;
- Cards informativos;
- Exemplos práticos;
- Perguntas e respostas;
- Quizzes;
- Materiais educativos;
- Links para fontes confiáveis;
- Conteúdos relacionados aos direitos trabalhistas.

Dessa forma, o projeto pretende estimular o usuário a **buscar informações, questionar conteúdos e verificar fontes antes de compartilhar informações**.

---

# 🛠️ Tecnologias utilizadas

## Front-end

### Angular

Responsável pela construção da interface da aplicação e pela interação com o usuário.

### TypeScript

Utilizado no desenvolvimento do front-end com Angular, proporcionando organização e tipagem ao código.

---

## Back-end

### Django

Framework Python utilizado para desenvolver a estrutura do back-end da aplicação.

### Django REST Framework

Responsável pela criação da API REST que permite a comunicação entre o Angular e o Django.

---

## Banco de dados

### PostgreSQL

Banco de dados relacional utilizado para armazenar as informações da plataforma.

Entre os dados que poderão ser armazenados estão:

- Usuários;
- Conteúdos;
- Categorias;
- Perguntas;
- Respostas;
- Resultados dos quizzes;
- Materiais educativos.

---

# 🏗️ Arquitetura

A aplicação seguirá uma arquitetura separando o front-end, back-end e banco de dados.

```text
                    ┌──────────────────────┐
                    │       USUÁRIO        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Angular + TypeScript │
                    │      Front-end       │
                    └──────────┬───────────┘
                               │
                         HTTP / JSON
                               │
                               ▼
                    ┌──────────────────────┐
                    │        Django        │
                    │   Django REST API    │
                    │       Back-end       │
                    └──────────┬───────────┘
                               │
                         Django ORM
                               │
                               ▼
                    ┌──────────────────────┐
                    │      PostgreSQL      │
                    │    Banco de Dados    │
                    └──────────────────────┘
