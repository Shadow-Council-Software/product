---
title: 'Academic Foundations for Mechanistic Interpreter PRD'
created: '2026-05-05'
type: 'research-index'
---

# Academic Foundations – Mechanistic Interpreter & Assurance Framework

This file indexes selected university theses and peer‑reviewed papers that ground the mechanisms described in the PRD (`prd.md`) and architecture document (`architecture.md`). Groupings follow the major capability clusters in the PRD.

## Deterministic Replay & System-Level Record/Replay

- **Deterministic replay for general and distributed systems**
  - Dennis Michael Geels, *Replay Debugging for Distributed Applications*, PhD dissertation, UC Berkeley EECS, 2006.  
    `https://www2.eecs.berkeley.edu/Pubs/TechRpts/2006/EECS-2006-163.html`
  - Gautam Altekar, *Replay Debugging for the Datacenter*, UCB/EECS‑2012‑216, EECS Department, University of California, Berkeley, 2012.  
    `https://www2.eecs.berkeley.edu/Pubs/TechRpts/2012/EECS-2012-216.html`
  - Anton Burtsev, *Deterministic Systems Analysis*, PhD dissertation, University of Utah, 2013.  
    `https://ics.uci.edu/~aburtsev/doc/xen-tt-dissertation-2013.pdf`
  - David Devecsery, *Enabling Program Analysis Through Deterministic Replay and Optimistic Hybrid Analysis*, PhD dissertation, University of Michigan, 2017.  
    `https://web.eecs.umich.edu/~pmchen/papers/devecsery17.pdf`

- **Language/VM‑level deterministic replay**
  - João Pedro Marques Silva, *Ditto – Deterministic Execution Replay for the Java Virtual Machine on Multi‑processors*, Master’s thesis, Instituto Superior Técnico, 2012.  
    `https://web.tecnico.ulisboa.pt/~ist14191/repository/MEIC-A-62505-JOAO-SILVA-thesis.pdf`

> **PRD alignment:** Replay envelope semantics, divergence classification, incident reconstruction (FR12–FR15, FR13, FR14).

## Program / Equation Synthesis from Traces

- Kuat Yessenov, *Program Synthesis from Execution Traces and Demonstrations*, PhD dissertation, MIT EECS, 2016.  
  `https://dspace.mit.edu/bitstream/handle/1721.1/106098/965386252-MIT.pdf`
- Natasha Yogananda Jeppu, *Learning Symbolic Abstractions from System Execution Traces*, DPhil dissertation, University of Oxford, 2022.  
  `https://ora.ox.ac.uk/objects/uuid:f5a0a678-e358-4e81-b64f-ddc8f8c28db7/files/df1881m41v`
- R.H.J. Klaassen, *Trace‑Guided Program Synthesis Using Large Language Model Priors*, Master’s thesis, TU Delft, 2026.  
  `https://repository.tudelft.nl/record/uuid:27fc0b11-cb70-463d-a5ba-2511f980415d`

> **PRD alignment:** Equation artifact creation and extraction from inference traces, symbolic intermediate representations (FR1–FR5, FR6, FR7).

## Functional / Semantic Equivalence & Comparators

- Berkeley Roshan Churchill, *Blackbox Equivalence Checking of Program Optimizations*, PhD dissertation, Stanford University, 2019.  
  `https://theory.stanford.edu/~aiken/publications/theses/churchill.pdf`
- Natasha Yogananda Jeppu, *Learning Symbolic Abstractions from System Execution Traces*, University of Oxford, 2022 (equivalence via simulation relations).  
  `https://ora.ox.ac.uk/objects/uuid:f5a0a678-e358-4e81-b64f-ddc8f8c28db7/files/df1881m41v`

> **PRD alignment:** Strict/semantic equivalence comparators, product‑program style reasoning, comparator governance (FR16–FR19, FR37).

## Mutation Testing & Test‑Assurance for ML / Complex Systems

- Lei Ma et al., *DeepMutation: Mutation Testing of Deep Learning Systems*, arXiv:1805.05206, 2018.  
  `https://arxiv.org/pdf/1805.05206`
- Florian Tambon, Foutse Khomh, Giuliano Antoniol, *A Probabilistic Framework for Mutation Testing in Deep Neural Networks*, arXiv:2208.06018, 2022.  
  `https://export.arxiv.org/pdf/2208.06018v1.pdf`

> **PRD alignment:** Mutation analysis over interpreter‑critical surfaces, probabilistic treatment of stochastic pipelines, mutation thresholds for promotion (FR20–FR22).

## Provenance, Reproducibility & Workflow Evidence

- Yu Shyang Tan, *Reconstructing Data Provenance from Log Files*, PhD thesis, University of Waikato, 2017.  
  `https://researchcommons.waikato.ac.nz/bitstream/10289/11388/4/thesis.pdf`
- William Lin, *Kubernetes Provenance*, MS thesis, University of Texas at Austin, 2020.  
  `https://repositories.lib.utexas.edu/bitstreams/f61d9feb-a7d0-4a56-960a-4a85487baca5/download`
- Mian Khawar Hasham Ahmad, *Scientific Workflow Execution Reproducibility using Cloud‑Aware Provenance*, PhD thesis, University of the West of England, 2016.  
  `https://files.core.ac.uk/download/pdf/323894425.pdf`
- Stian Soiland‑Reyes et al., *Recording Provenance of Workflow Runs with RO‑Crate*, PLOS ONE 19(9):e0309210, University of Manchester, 2024.  
  `https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0309210`

> **PRD alignment:** Immutable provenance bundles, cloud‑aware replay, evidence graph comparison, workflow‑level reproducibility (FR4, FR11, FR14, FR23–FR26, FR35–FR36).

## Immutable Audit Logs, Transparency & Cryptographic Attestation

- Mohit B. Thazhath, *Harpocrates: Privacy‑Preserving and Immutable Audit Log for Sensitive Data Operations*, MS thesis, Virginia Tech, 2022.  
  `https://vtechworks.lib.vt.edu/server/api/core/bitstreams/7f721717-66cb-430f-866c-dd138e05d326/content`
- Ghazal Shenavar, *Attestation of Distributed Applications*, Master’s thesis, Aalto University, 2025.  
  `https://aaltodoc.aalto.fi/server/api/core/bitstreams/65adc71a-b148-413b-b305-78c670d8611c/content`
- John Lyle, *Trustworthy Services Through Attestation*, DPhil dissertation, University of Oxford, 2010.  
  `https://ora.ox.ac.uk/objects/uuid:a99b5bd5-e164-48e8-85ed-d0a35908f7b7/files/m7355a55ad0f739d561306272af46d6a7`
- Thore Carl Göbel, *Security Analysis of Proton Key Transparency*, Master’s thesis, ETH Zürich, 2023.  
  `https://ethz.ch/content/dam/ethz/special-interest/infk/inst-infsec/appliedcrypto/education/theses/_Master_Thesis_Thore_Goebel_Proton_Key_Transparency.pdf`
- Luis Wengenmair, *Signed Certificate Timestamps: A Never‑Failing Promise?*, Bachelor’s thesis, 2024.  
  `https://talhaparacha.com/thesis_ct_logs_full.pdf`
- C2PA, *Attestation in the C2PA Framework*, Spec 1.4, 2024.  
  `https://spec.c2pa.org/specifications/specifications/1.4/attestations/attestation.html`

> **PRD alignment:** Append‑only evidence stores, Merkle‑style transparency trees, key directories, and signed manifests / attestations for evidence bundles (FR26, FR45, FR49, FR57–FR58; NFR‑SEC‑006, NFR‑SEC‑EE‑001).

