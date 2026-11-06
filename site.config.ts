export interface SiteConfig {
  title: string;
  tagline: string;
  description: string;
  author: string;
  url: string;
  language: string;

  // Integração completa com o Git / GitHub
  // Qualquer pessoa que der Fork no repositório pode personalizar o owner, repo e branch aqui!
  git: {
    enabled: boolean;
    provider: "github";
    owner: string;
    repo: string;
    branch: string;
    postsPath: string;   // pasta onde os arquivos markdown são armazenados
    docsPath: string;    // pasta onde a documentação do site é armazenada
    authorsPath: string; // pasta onde os perfis de autores são armazenados
  };

  // Destaques e textos da página inicial
  hero: {
    badge: string;
    title: string;
    description: string;
  };

  // Frase / citação de destaque na página inicial
  quote: {
    text: string;
    author: string;
  };

  // Mastro e cabeçalho dinâmico
  masthead?: {
    prefix?: string;
    rotatingWords?: string[];
  };

  // Configurações editoriais e de taxonomia
  editorial: {
    defaultCategory: string;
    categories: string[];
    defaultAuthor: string;
    wordsPerMinute: number;
  };
}

export const siteConfig: SiteConfig = {
  title: "Maltése",
  tagline: "Revista Open-source e livre",
  description:
    "Revista autoral e coletiva dedicada a ensaios, manifestos, pensamento crítico, filosofia social e reflexões sobre a liberdade e emancipação.",
  author: "Maltese",
  url: "https://www.maltese.app.br/",
  language: "pt-BR",

  // Textos da seção Hero da página principal
  hero: {
    badge: "100% Open-source • Publicação Simplificada",
    title: "Revista soberana e livre de intermediários.",
    description:
      "Um ecossistema editorial de código aberto para quem valoriza a permanência das ideias e o controle sobre seus dados. Escreva em Markdown puro, comite direto pelo navegador e hospede gratuitamente em qualquer nuvem estática. Dê um fork e erga seu próprio espaço — sem algoritmos de vigilância, sem banco de dados e sem aprisionamento.",
  },

  // Citação / Frase de reflexão da página principal
  quote: {
    text: "O único herói autêntico é o herói coletivo, nunca o homem solitário. Nenhum ser humano se salva sozinho; a coragem só ganha sentido na solidariedade.",
    author: "Héctor Germán Oesterheld (O Eternauta)",
  },

  // Configuração do mastro do cabeçalho
  masthead: {
    prefix: "Revista aberta de",
    rotatingWords: [
      "Ensaios",
      "Manifestos",
      "Crônicas",
      "Poemas",
      "Epístolas",
      "Sonetos",
      "Panfletos",
      "Tratados",
      "Elegias",
      "Odes",
      "Diálogos",
      "Aforismos",
      "Contos",
      "Sátiras",
      "Prosas",
      "Poéticas",
      "Confissões",
      "Parábolas",
      "Fragmentos",
      "Memórias",
      "Glosas",
      "Apólogos",
      "Discursos",
      "Teses",
      "Monólogos",
      "Prólogos",
      "Escritos",
    ],
  },

  // Configuração padrão do repositório Git
  git: {
    enabled: false,
    provider: "github",
    owner: "",
    repo: "",
    branch: "",
    postsPath: "content/posts",
    docsPath: "content/docs",
    authorsPath: "content/authors",
  },

  editorial: {
    defaultCategory: "Manifestos",
    categories: [
      "Manifesto",
      "Ensaio",
      "Crítica Social",
      "Poesia & Fragmentos",
      "Filosofia & Teoria",
      "Crônica",
      "Reflexão",
      "Artigo de opnião"
    ],
    defaultAuthor: "Maltese",
    wordsPerMinute: 200,
  },
};

export default siteConfig;
