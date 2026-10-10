import Link from "next/link";
import { Flame, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Manifesto & Sobre o Caderno",
  description:
    "Conheça os princípios, a ética e a proposta editorial do Caderno Maltese.",
};

export default function SobrePage() {
  return (
    <article className="max-w-3xl mx-auto space-y-10 animate-in fade-in duration-300">
      {/* Title */}
      <header className="space-y-3 border-b pb-6" style={{ borderColor: "var(--border-color)" }}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "var(--accent-red-light)", color: "var(--accent-red)" }}>
          <Flame className="w-3.5 h-3.5" />
          <span>Manifesto Editorial</span>
        </div>
        <h1
          className="text-3xl sm:text-5xl font-extrabold tracking-tight font-serif"
          style={{ fontFamily: "var(--font-serif-title)", color: "var(--text-primary)" }}
        >
          Sobre o Caderno & Propósito
        </h1>
        <p className="text-lg italic" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-serif-body)" }}>
          Uma trincheira para a reflexão serena, a insubmissão ética e a emancipação humana.
        </p>
      </header>

      {/* Main Content */}
      <div className="prose-content text-base sm:text-lg space-y-6" style={{ fontFamily: "var(--font-serif-body)" }}>
        <p>
          O <strong>Caderno Maltese</strong> nasce da convicção de que a palavra escrita, quando liberta da tirania das métricas imediatistas e dos imperativos comerciais, permanece como um dos mais potentes instrumentos de despertar da consciência crítica.
        </p>

        <blockquote>
          &ldquo;A liberdade sem o socialismo é privilégio e injustiça; o socialismo sem a liberdade é escravidão e brutalidade.&rdquo;
          <br />
          <span className="text-xs uppercase font-sans tracking-widest not-italic mt-2 block opacity-70">
            — Mikhail Bakunin
          </span>
        </blockquote>

        <h2>I. Da Recusa aos Algoritmos e à Vigilância</h2>
        <p>
          A internet contemporânea foi gradualmente encurralada por plataformas que transformam leitores em produtos e o pensamento reflexivo em mero combustível para gerar reações impulsivas.
        </p>
        <p>
          Este espaço foi desenhado intencionalmente na contramão dessa lógica:
        </p>
        <ul>
          <li><strong>Zero Rastreamento:</strong> Nenhum pixel de espionagem, nenhum anúncio comercial, nenhum cookie intrusivo.</li>
          <li><strong>Zero Banco de Dados:</strong> Todos os textos existem em formato de arquivos Markdown abertos, garantindo preservação histórica, soberania técnica e máxima velocidade.</li>
          <li><strong>Acesso Livre e Irrestrito:</strong> Conhecimento não é mercadoria. Nenhuma barreira de pagamento (paywall) jamais dividirá os leitores.</li>
        </ul>

        <h2>II. Eixos de Pensamento</h2>
        <p>
          Os escritos aqui reunidos transitam pela tradição do pensamento crítico libertário, pelo socialismo humanista e pela literatura comprometida com a dignidade da vida:
        </p>
        <ul>
          <li><strong>Autonomia e Auto-organização:</strong> A crença inabalável na capacidade humana de construir instituições horizontais baseadas no apoio mútuo.</li>
          <li><strong>Crítica à Alienação do Tempo:</strong> A defesa do direito à fruição, à contemplação, à arte e à convivência desinteressada.</li>
          <li><strong>A Ternura como Resistência:</strong> A recusa do cinismo e a preservação do afeto como força política indispensável.</li>
          <li><strong>Repúdio Inegociável ao Ódio e ao Preconceito:</strong> A rejeição absoluta a qualquer forma de discurso de ódio, intolerância, fanatismo ou desumanização. A liberdade autêntica é coletiva, solidária e emancipadora — ela jamais poderá ser usada como escudo para justificar a opressão ou violar a dignidade alheia.</li>
        </ul>

        <h2>III. Editora Aberta & Submissão de Textos</h2>
        <p>
          O <strong>Caderno Maltese</strong> opera como uma prensa editorial aberta e comunitária. Qualquer pessoa pode propor a publicação de seus ensaios, poesias ou manifestos: basta utilizar o nosso <Link href="/gerador" className="underline font-semibold" style={{ color: "var(--accent-red)" }}>Gerador de MD</Link> e abrir um <strong>Pull Request</strong> no repositório do GitHub.
        </p>
        <p>
          Todos os textos recebidos passam por leitura fraterna e revisão editorial, e os aprovados são incorporados ao catálogo do caderno sob licença livre Copyleft.
        </p>
      </div>

      {/* CTA Box */}
      <div
        className="p-6 sm:p-8 rounded-2xl border text-center space-y-4"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border-color)",
        }}
      >
        <h3 className="text-xl font-serif font-bold" style={{ fontFamily: "var(--font-serif-title)", color: "var(--text-primary)" }}>
          Pronto para explorar as leituras?
        </h3>
        <p className="text-sm max-w-md mx-auto" style={{ color: "var(--text-secondary)" }}>
          Acesse o índice completo com todos os ensaios e manifestos organizados por temas e categorias.
        </p>
        <Link
          href="/textos"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all shadow-sm"
          style={{
            backgroundColor: "var(--accent-red)",
            color: "#ffffff",
          }}
        >
          <span>Ir para o Arquivo de Textos</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}
