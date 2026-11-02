import Link from "next/link";
import { Flame, ArrowRight, BookOpen, Users, GitBranch, Unlock } from "lucide-react";
import siteConfig from "@site-config";

export const metadata = {
  title: "Manifesto",
  description: `Conheça os valores, objetivos e a proposta editorial da revista ${siteConfig.title}.`,
};

export default function SobrePage() {
  return (
    <article className="max-w-3xl mx-auto space-y-12 animate-in fade-in duration-300">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="space-y-4 border-b pb-8" style={{ borderColor: "var(--border-color)" }}>
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
          style={{ backgroundColor: "var(--accent-red-light)", color: "var(--accent-red)" }}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Manifesto Editorial</span>
        </div>

        <h1
          className="text-3xl sm:text-5xl font-extrabold tracking-tight"
          style={{ fontFamily: "var(--font-serif-title)", color: "var(--text-primary)" }}
        >
          {siteConfig.title}
        </h1>

        <p
          className="text-lg sm:text-xl italic leading-relaxed"
          style={{ color: "var(--text-secondary)", fontFamily: "var(--font-serif-body)" }}
        >
          Uma revista aberta, livre de intermediários e comprometida com a democratização da palavra escrita.
        </p>
      </header>

      {/* ── Manifesto body ───────────────────────────────────────────────────── */}
      <div
        className="prose-content space-y-6 text-base sm:text-lg"
        style={{ fontFamily: "var(--font-serif-body)", color: "var(--text-primary)" }}
      >
        <p>
          A <strong>{siteConfig.title}</strong> é uma revista independente de código aberto. Nasceu da
          crença de que publicar não deveria ser um privilégio reservado a quem tem acesso a editoras,
          plataformas proprietárias ou orçamentos de marketing — mas um direito exercido por qualquer
          pessoa com algo a dizer.
        </p>

        <blockquote>
          &ldquo;O único herói autêntico é o herói coletivo, nunca o homem solitário. Nenhum ser humano
          se salva sozinho; a coragem só ganha sentido na solidariedade.&rdquo;
          <br />
          <span className="text-xs uppercase font-sans tracking-widest not-italic mt-2 block opacity-70">
            — Héctor Germán Oesterheld (O Eternauta)
          </span>
        </blockquote>

        <h2>I. O problema que queremos resolver</h2>
        <p>
          A internet centralizou a publicação de ideias nas mãos de poucas plataformas. Algoritmos
          decidem o que circula, rankings definem o que vale a pena ler e paywalls criam muros entre o
          pensamento e quem quer acessá-lo. O resultado é uma mídia que premia a impulsividade,
          recompensa a superficialidade e descarta o que não gera engajamento imediato.
        </p>
        <p>
          Ensaios, manifestos, poemas, crônicas e reflexões longas — exatamente o tipo de texto que
          forma leitores críticos — são sistematicamente penalizados nesse modelo. Queremos mudar isso.
        </p>

        <h2>II. Nossa proposta</h2>
        <p>
          A {siteConfig.title} funciona como uma prensa tipográfica do século XXI: qualquer pessoa pode
          escrever, publicar e distribuir seus textos sem pedir permissão a nenhuma corporação. Toda a
          infraestrutura é aberta, auditável e replicável.
        </p>

        <ul>
          <li>
            <strong>Sem banco de dados.</strong> Os textos existem como arquivos Markdown simples —
            portáteis, duráveis e independentes de qualquer servidor proprietário.
          </li>
          <li>
            <strong>Sem rastreamento.</strong> Nenhum pixel de espionagem, nenhum cookie intrusivo,
            nenhum perfil de comportamento sendo construído às suas costas.
          </li>
          <li>
            <strong>Sem paywall.</strong> O conhecimento não é mercadoria. Cada texto publicado aqui é
            de acesso livre e irrestrito, para sempre.
          </li>
          <li>
            <strong>Sem intermediários.</strong> Um commit no Git é tudo que separa um texto do seu
            público. Nenhum algoritmo de curadoria decide o que merece ser lido.
          </li>
        </ul>

        <h2>III. Democratização da mídia</h2>
        <p>
          Acreditamos que a descentralização da publicação é uma questão política, não apenas técnica.
          Quando vozes diversas conseguem publicar com a mesma facilidade com que grandes veículos
          operam, o debate público se torna mais plural e mais honesto.
        </p>
        <p>
          Por isso o código-fonte desta revista é inteiramente aberto. Qualquer pessoa, coletivo ou
          movimento pode fazer um fork do repositório e erguer sua própria publicação — com sua própria
          identidade, seus próprios autores e seus próprios valores — sem depender de nenhuma
          plataforma de terceiros.
        </p>

        <blockquote>
          &ldquo;A liberdade de imprensa pertence a quem possui uma.&rdquo;
          <br />
          <span className="text-xs uppercase font-sans tracking-widest not-italic mt-2 block opacity-70">
            — A. J. Liebling
          </span>
        </blockquote>

        <p>
          Estamos aqui para mudar isso. A prensa é de quem escreve.
        </p>

        <h2>IV. O que publicamos</h2>
        <p>
          A {siteConfig.title} acolhe textos comprometidos com o pensamento crítico, a emancipação
          humana e a dignidade da vida — independente do gênero textual:
        </p>
        <ul>
          <li>Ensaios e análises políticas, culturais e filosóficas</li>
          <li>Manifestos e textos programáticos</li>
          <li>Crônicas, poemas e prosa literária</li>
          <li>Reflexões sobre tecnologia, mídia e sociedade</li>
        </ul>
        <p>
          O único critério inegociável é o respeito à dignidade humana. Não há espaço aqui para
          discursos de ódio, intolerância ou qualquer forma de desumanização. Liberdade autêntica é
          coletiva — ela não pode ser usada como escudo para oprimir.
        </p>

        <h2>V. Como publicar</h2>
        <p>
          Contribuir é simples e não exige conhecimento técnico avançado. Use o{" "}
          <Link href="/gerador" className="underline font-semibold" style={{ color: "var(--accent-red)" }}>
            editor integrado
          </Link>{" "}
          para escrever seu texto em Markdown, configure sua conexão com o GitHub e faça o commit
          diretamente pelo navegador. Seu texto entra no repositório e vai ao ar na próxima build.
        </p>
        <p>
          Se preferir a rota tradicional, abra um Pull Request no repositório público com o arquivo
          Markdown do seu texto. A revisão é fraterna e os textos aprovados são incorporados sob
          licença livre Copyleft.
        </p>
      </div>

      {/* ── Value pillars ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Unlock, label: "Acesso livre", desc: "Sem paywall, sem cadastro" },
          { icon: Users, label: "Publicação aberta", desc: "Qualquer voz, qualquer texto" },
          { icon: GitBranch, label: "Código aberto", desc: "Fork e publique o seu" },
          { icon: BookOpen, label: "Sem algoritmos", desc: "O texto fala por si" },
        ].map(({ icon: Icon, label, desc }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border text-center"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "var(--accent-red-light)" }}
            >
              <Icon className="w-4 h-4" style={{ color: "var(--accent-red)" }} />
            </div>
            <p className="text-xs font-bold leading-tight" style={{ color: "var(--text-primary)" }}>{label}</p>
            <p className="text-[11px] opacity-60 leading-tight" style={{ color: "var(--text-muted)" }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <div
        className="p-6 sm:p-8 rounded-2xl border text-center space-y-4"
        style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
      >
        <h3
          className="text-xl font-bold"
          style={{ fontFamily: "var(--font-serif-title)", color: "var(--text-primary)" }}
        >
          Comece a ler — ou comece a escrever.
        </h3>
        <p className="text-sm max-w-sm mx-auto" style={{ color: "var(--text-secondary)" }}>
          O arquivo está aberto. A prensa também.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/textos"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all"
            style={{ backgroundColor: "var(--accent-red)", color: "#ffffff" }}
          >
            <BookOpen className="w-4 h-4" />
            Arquivo de Textos
          </Link>
          <Link
            href="/gerador"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm border transition-all hover:border-[var(--accent-red)] hover:text-[var(--accent-red)]"
            style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)" }}
          >
            <ArrowRight className="w-4 h-4" />
            Publicar um texto
          </Link>
        </div>
      </div>

    </article>
  );
}
