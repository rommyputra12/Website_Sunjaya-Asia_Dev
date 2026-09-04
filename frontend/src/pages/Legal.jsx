import React from "react";
import { useParams, Link } from "react-router-dom";
import { Reveal } from "../components/motion/Reveal";

const POLICIES = {
  "data-protection": {
    title: "Global Data Protection Policy",
    updated: "Last Updated: August 2026",
    intro:
      "Sunjaya Asia Group Limited and its subsidiaries (\"Company\", \"we\", \"us\", or \"our\") are committed to protecting the privacy, confidentiality, and security of all personal data we process across our global operations. This Global Data Protection Policy outlines how we collect, use, store, transfer, and safeguard personal data in compliance with applicable international data privacy laws.",
    sections: [
      {
        n: 1,
        heading: "Scope and Applicability",
        body:
          "This Policy applies to all employees, contractors, partners, vendors, and third parties who process personal data on behalf of the Company. It governs all personal data collected through our websites, digital applications, global business activities, commercial transactions, and recruitment processes across all jurisdictions where we operate.",
      },
      {
        n: 2,
        heading: "Core Data Protection Principles",
        body:
          "We adhere strictly to internationally recognized data protection principles. Personal data shall be:",
        list: [
          "Processed Lawfully, Fairly, and Transparently: Obtained with proper legal bases and clear notifications.",
          "Purpose-Limited: Collected strictly for specified, explicit, and legitimate business purposes.",
          "Data Minimized: Adequate, relevant, and limited to what is necessary for the stated purpose.",
          "Accurate and Up-to-Date: Maintained with reasonable steps to ensure inaccurate data is corrected or deleted without delay.",
          "Storage-Limited: Kept in a form that permits identification for no longer than is necessary.",
          "Secured with Integrity: Protected against unauthorized or unlawful processing, accidental loss, destruction, or damage using appropriate technical and organizational measures.",
        ],
      },
      {
        n: 3,
        heading: "Legal Bases for Processing",
        body:
          "We process personal data only when one or more of the following legal grounds apply:",
        list: [
          "Consent: When the data subject has given clear, affirmative consent.",
          "Contractual Necessity: To perform a contract with the individual or take pre-contractual steps.",
          "Legal Obligation: To comply with regulatory or legal requirements.",
          "Legitimate Interests: To pursue legitimate commercial or operational interests, provided they do not override individual rights.",
        ],
      },
      {
        n: 4,
        heading: "International Data Transfers",
        body:
          "As a global enterprise operating across multiple jurisdictions, personal data may be transferred to and processed in countries outside the data subject's country of residence. Where cross-border data transfers occur, we implement appropriate safeguards to ensure an adequate level of data protection, including:",
        list: [
          "Standard Contractual Clauses (SCCs) approved by relevant authorities.",
          "Binding Corporate Rules (BCRs) for intra-group transfers.",
          "Compliance with local cross-border transfer requirements (such as GDPR, CCPA, and Indonesia Personal Data Protection Law).",
        ],
      },
      {
        n: 5,
        heading: "Data Security Measures",
        body:
          "We implement robust technical, physical, and administrative security standards to safeguard personal data, including:",
        list: [
          "Encryption: End-to-end encryption for data in transit and at rest.",
          "Access Control: Strict role-based access restrictions and multi-factor authentication.",
          "Infrastructure Security: Continuous monitoring, vulnerability assessments, and secure cloud environments.",
          "Employee Training: Regular data privacy and cybersecurity awareness programs for all personnel.",
        ],
      },
      {
        n: 6,
        heading: "Data Subject Rights",
        body:
          "Individuals whose personal data we hold possess specific privacy rights under applicable global laws, including the right to:",
        list: [
          "Access: Request a copy of the personal data held about them.",
          "Rectification: Request correction of inaccurate or incomplete data.",
          "Erasure (\"Right to be Forgotten\"): Request deletion of data where legal grounds permit.",
          "Restriction & Objection: Restrict or object to the processing of their data.",
          "Data Portability: Request transfer of data to another controller in a structured format.",
          "Withdraw Consent: Withdraw consent at any time without affecting prior lawful processing.",
        ],
      },
      {
        n: 7,
        heading: "Data Breach Notification",
        body:
          "In the event of a security incident leading to a personal data breach, we maintain a comprehensive incident response plan. We will notify relevant regulatory authorities and affected individuals within the timelines prescribed by applicable law (e.g., within 72 hours under GDPR/UU PDP guidelines) when required.",
      },
      {
        n: 8,
        heading: "Contact Information & Data Protection Office",
        body:
          "If you have questions, concerns, or wish to exercise your data privacy rights, please contact our Data Protection Office:",
        contact: {
          entity: "Sunjaya Asia Group Limited",
          email: "corporate.services@sunjayaasia.com",
          address:
            "Menara Sunlife, Level 16th, Kawasan Mega Kuningan, Jakarta Selatan, DKI Jakarta, Indonesia 12950",
        },
      },
    ],
  },
  "cookie-statement": {
    title: "Cookie Statement",
    updated: "Last Updated: August 2026",
    intro:
      "Sunjaya Asia Group Limited (\"the Group,\" \"we,\" \"us,\" or \"our\") is committed to upholding the highest standards of transparency, data governance, and digital security. This Cookie Statement outlines the deployment, classification, and administration of cookies and related telemetry technologies across our digital domains.",
    sections: [
      {
        n: 1,
        heading: "Nature and Function of Cookies",
        body:
          "Cookies are small, encrypted text files deposited on your device upon accessing our digital infrastructure. These mechanisms enable the platform to verify user sessions, safeguard against unauthorized network transactions, maintain technical integrity, and capture aggregated, non-personally identifiable operational metrics.",
      },
      {
        n: 2,
        heading: "Categorization of Tracking Technologies",
        body:
          "The Group deploys three principal categories of tracking technologies across its digital domains, each serving a distinct operational purpose:",
        list: [
          "Strictly Necessary Cookies: Fundamental to the operational integrity, network routing, and security protocols of the website. These tokens facilitate load balancing, secure session management, and cryptographic authentication. Because the platform cannot operate securely without these components, they cannot be deactivated within our systems.",
          "Performance & Telemetry Cookies: Utilized to evaluate platform throughput, latency, traffic sources, and navigational flow. All data collected by these cookies is aggregated and fully anonymized, serving exclusively to optimize site architecture, system stability, and information delivery across global networks.",
          "Functional & Configuration Cookies: Designed to preserve localized user parameters, such as interface language, geographical preferences, and display configurations. These tokens eliminate redundant configuration requests during subsequent sessions, providing a cohesive interface.",
        ],
      },
      {
        n: 3,
        heading: "Third-Party Infrastructure & Analytics Integration",
        body:
          "The Group may engage authorized, enterprise-tier third-party service providers (including cloud delivery networks, security firewalls, and analytics engines) to maintain platform resilience and monitor traffic integrity. These service providers operate under strict data processing agreements and are contractually prohibited from utilizing collected metrics for independent commercial exploitation.",
      },
      {
        n: 4,
        heading: "Governance and Preference Management",
        body:
          "Users retain full authority over the placement and retention of non-essential tracking technologies:",
        list: [
          "Platform Preference Interface: You may modify or revoke your consent at any time via the Cookie Settings link situated in the website footer.",
          "Browser-Level Disablement: Web browsers provide administrative controls allowing the rejection, selective blocking, or deletion of tracking files. Configuration pathways vary by browser architecture (e.g., Settings → Privacy & Security → Cookies and Site Data).",
          "Note: Restricting functional or telemetry cookies will not inhibit basic site access, but may degrade specific navigational features and performance responsiveness.",
        ],
      },
      {
        n: 5,
        heading: "Regulatory Alignment and Amendments",
        body:
          "Sunjaya Asia Group Limited reserves the unilateral right to revise this Statement to ensure continuous alignment with international data protection frameworks, technological standards, and Group governance policies. Any modifications take effect immediately upon deployment to this URL.",
      },
      {
        n: 6,
        heading: "Corporate Inquiries",
        body:
          "For formal communications regarding this Statement or our data integrity standards, contact the corporate governance office:",
        contact: {
          entity: "Sunjaya Asia Group Limited",
          email: "corporate@sunjayagroup.com",
          address:
            "Menara Sun Life, Level 16, Jl. Dr. Ide Anak Agung Gde Agung, Mega Kuningan, Jakarta Selatan, Indonesia",
        },
      },
    ],
  },
  "terms-of-use": {
    title: "Terms of Use",
    updated: "Last Updated: August 2026",
    intro:
      "Welcome to the official website of Sunjaya Asia Group and its subsidiaries (\"Company\", \"we\", \"us\", or \"our\"). These Terms of Use (\"Terms\") govern your access to and use of our websites, digital portals, content, and online services (collectively, the \"Services\"). By accessing, browsing, or using our Services, you acknowledge that you have read, understood, and agree to be bound by these Terms and to comply with all applicable laws and regulations. If you do not agree with these Terms, please do not use our Services.",
    sections: [
      {
        n: 1,
        heading: "Intellectual Property Rights",
        body:
          "Unless otherwise indicated, all content, features, and functionality on this website—including but not limited to text, graphics, logos, icons, trademarks, service marks, software, audio, video, designs, and data compilations—are the exclusive property of Sunjaya Asia Group, its affiliates, or its licensors, and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.",
        list: [
          "Limited License: You are granted a limited, non-exclusive, non-transferable, and revocable license to access and view the content solely for personal, informational, and non-commercial purposes.",
          "Restrictions: You may not copy, reproduce, modify, distribute, transmit, display, perform, publish, license, create derivative works from, transfer, or sell any information or material obtained from our Services without our prior written consent.",
        ],
      },
      {
        n: 2,
        heading: "Acceptable Use Policy",
        body: "You agree to use our Services only for lawful purposes and in accordance with these Terms. You explicitly agree not to:",
        list: [
          "Use the Services in any way that violates any applicable local, national, or international law or regulation.",
          "Attempt to gain unauthorized access to, interfere with, damage, or disrupt any parts of our website, server, network, or database connected to our Services.",
          "Introduce viruses, Trojan horses, worms, logic bombs, or other harmful technological material.",
          "Conduct automated data collection, scraping, mining, or extraction activities without express permission.",
          "Misrepresent your identity, affiliation, or authority to act on behalf of any entity.",
        ],
      },
      {
        n: 3,
        heading: "Corporate Information & Materials",
        body:
          "The materials provided on this website are for general information purposes only. While Sunjaya Asia Group endeavors to keep the content accurate and up to date:",
        list: [
          "Content may be updated, modified, or deleted at any time without prior notice.",
          "Any reliance you place on information found on our Services is strictly at your own risk.",
          "Press releases, corporate statements, and publications speak only as of their original issuance dates.",
        ],
      },
      {
        n: 4,
        heading: "Third-Party Links & Services",
        body:
          "Our Services may contain links to third-party websites, portals, or resources (including partners, vendors, or regulatory bodies) that are not owned or controlled by Sunjaya Asia Group.",
        list: [
          "We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites.",
          "Inclusion of any link does not imply endorsement, sponsorship, or recommendation by Sunjaya Asia Group. Accessing third-party sites is done at your own risk.",
        ],
      },
      {
        n: 5,
        heading: "Disclaimer of Warranties",
        body:
          'TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, THE SERVICES AND ALL CONTENT ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.',
        list: [
          "SUNJAYA ASIA GROUP EXPRESSLY DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO:",
          "IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.",
          "WARRANTIES THAT THE SERVICES WILL BE UNINTERRUPTED, TIMELY, SECURE, ACCURATE, OR ERROR-FREE.",
          "WARRANTIES REGARDING THE RESULTS THAT MAY BE OBTAINED FROM THE USE OF THE SERVICES.",
        ],
      },
      {
        n: 6,
        heading: "Limitation of Liability",
        body:
          "IN NO EVENT SHALL SUNJAYA ASIA GROUP, ITS AFFILIATES, DIRECTORS, OFFICERS, EMPLOYEES, AGENTS, OR LICENSORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, PUNITIVE, OR EXEMPLARY DAMAGES (INCLUDING LOSS OF PROFITS, DATA, GOODWILL, OR BUSINESS INTERRUPTION) ARISING OUT OF OR IN CONNECTION WITH:",
        list: [
          "YOUR ACCESS TO, USE OF, OR INABILITY TO USE THE SERVICES.",
          "ANY UNAUTHORIZED ACCESS TO OR ALTERATION OF YOUR TRANSMISSIONS OR DATA.",
          "ANY CONTENT OR CONDUCT OF ANY THIRD PARTY ON THE SERVICES.",
          "THIS LIMITATION APPLIES REGARDLESS OF THE LEGAL THEORY (CONTRACT, TORT, NEGLIGENCE, STRICT LIABILITY, OR OTHERWISE), EVEN IF SUNJAYA ASIA GROUP HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.",
        ],
      },
      {
        n: 7,
        heading: "Indemnification",
        body:
          "You agree to defend, indemnify, and hold harmless Sunjaya Asia Group, its subsidiaries, affiliates, officers, directors, employees, and agents from and against any claims, liabilities, damages, judgments, awards, losses, costs, or expenses (including reasonable legal fees) resulting from your violation of these Terms or your unauthorized use of our Services.",
      },
      {
        n: 8,
        heading: "Privacy & Data Protection",
        body:
          "Your privacy is important to us. Access to and processing of personal data collected through our Services are governed by our Privacy Policy (available on our website), which is incorporated into these Terms by reference.",
      },
      {
        n: 9,
        heading: "Governing Law & Dispute Resolution",
        body:
          "These Terms and any dispute or claim arising out of or in connection with them shall be governed by and construed in accordance with the substantive laws of Singapore (or the primary corporate jurisdiction of Sunjaya Asia Group), without giving effect to any choice or conflict of law principles.",
        list: [
          "Amicable Settlement: In the event of any controversy or dispute, the parties shall first attempt to resolve the matter through good-faith negotiations.",
          "Jurisdiction: Any unresolved dispute shall be submitted to the exclusive jurisdiction of the competent courts in Singapore (or the designated corporate jurisdiction).",
        ],
      },
      {
        n: 10,
        heading: "Modifications to Terms",
        body:
          "Sunjaya Asia Group reserves the right, at its sole discretion, to revise, modify, or update these Terms at any time. Any changes will become effective immediately upon posting to the website with an updated \"Last Updated\" date. Your continued use of the Services following the posting of revised Terms constitutes your acceptance of the changes.",
      },
      {
        n: 11,
        heading: "Contact Information",
        body:
          "If you have any questions, concerns, or legal inquiries regarding these Terms of Use, please contact us at:",
        contact: {
          entity: "Sunjaya Asia Group — Legal & Compliance Department – Corporate Services Division",
          email: "legal.compliance@sunjayaasia.com / corporate.services@sunjayaasia.com",
          address: "Legal inquiries regarding these Terms of Use",
        },
      },
    ],
  },
  "investor-relations": {
    title: "Investor Relations",
    updated: "Last Updated: August 2026",
    intro:
      "Sunjaya Asia Group Limited welcomes inquiries from investors and financial partners. Our Investor Relations page provides key information about our business pillars, governance, and growth strategy. The full content is being prepared and will be published soon.",
    sections: [],
  },
};

const POLICY_LINKS = [
  { slug: "data-protection", label: "Data Protection Policy" },
  { slug: "cookie-statement", label: "Cookie Statement" },
  { slug: "terms-of-use", label: "Terms of Use" },
  { slug: "investor-relations", label: "Investor Relations" },
];

export default function Legal() {
  const { type } = useParams();
  const policy = POLICIES[type] || POLICIES["data-protection"];

  return (
    <div data-testid="legal-page" className="pt-32 pb-24 section-light min-h-screen">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10">
        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-16">
          <div className="md:col-span-8">
            <span className="font-mono text-[10px] tracking-[0.24em] uppercase text-copper">
              Legal
            </span>
            <h1 className="font-serif text-2xl md:text-4xl leading-[1.1] tracking-[-0.02em] text-bone mt-3">
              {policy.title}
            </h1>
            <p className="mt-4 font-mono text-[10px] tracking-[0.18em] uppercase text-ash">
              {policy.updated}
            </p>
          </div>

          {/* Policy switcher */}
          <div className="md:col-span-4 md:border-l md:border-black/10 md:pl-8">
            <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-copper mb-4">
              Policies
            </div>
            <nav className="flex flex-col gap-2">
              {POLICY_LINKS.map((p) => (
                <Link
                  key={p.slug}
                  to={`/legal/${p.slug}`}
                  className={`font-mono text-[11px] tracking-[0.12em] uppercase transition-colors ${
                    p.slug === type || (!type && p.slug === "data-protection")
                      ? "text-copper font-bold"
                      : "text-bone/70 hover:text-copper"
                  }`}
                >
                  {p.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Intro */}
        <Reveal>
          <p className="text-bone/80 text-base md:text-lg leading-[1.75] max-w-3xl mb-16">
            {policy.intro}
          </p>
        </Reveal>

        {/* Sections */}
        {policy.sections.length > 0 && (
          <div className="max-w-3xl">
            {policy.sections.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.04}>
                <section className="border-t border-black/10 py-8 md:py-10">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-3">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-[9px] tracking-[0.22em] uppercase text-copper/70">
                          Section
                        </span>
                        <span className="chapter-num text-2xl md:text-3xl">{s.n}.</span>
                      </div>
                    </div>
                    <div className="md:col-span-9">
                      <h2 className="font-serif text-xl md:text-2xl text-bone tracking-tight leading-[1.2] mb-4">
                        {s.heading}
                      </h2>
                      {s.body && (
                        <p className="text-bone/80 text-sm md:text-base leading-[1.75]">
                          {s.body}
                        </p>
                      )}
                      {s.list && (
                        <ol className="mt-5 space-y-3">
                          {s.list.map((item, idx) => (
                            <li
                              key={item}
                              className="flex items-start gap-3 text-bone/80 text-sm md:text-base leading-[1.65]"
                            >
                              <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-copper/70 mt-1 shrink-0 min-w-[1.5rem]">
                                ({String.fromCharCode(97 + idx)})
                              </span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ol>
                      )}
                      {s.contact && (
                        <div className="mt-6 border-l-2 border-copper/60 pl-5 space-y-1.5">
                          <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-copper">
                            Entity
                          </div>
                          <p className="text-bone text-sm md:text-base">{s.contact.entity}</p>
                          <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-copper pt-2">
                            Email
                          </div>
                          <a
                            href={`mailto:${s.contact.email}`}
                            className="text-bone text-sm md:text-base hover:text-copper transition-colors"
                          >
                            {s.contact.email}
                          </a>
                          <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-copper pt-2">
                            Address
                          </div>
                          <p className="text-bone/80 text-sm md:text-base leading-[1.6] max-w-md">
                            {s.contact.address}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
