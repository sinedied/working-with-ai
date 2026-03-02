<div align="center">

# 🤖 Working with AI

*Could AI do your job? Take the quiz and find out.*

[![Deploy](https://img.shields.io/github/actions/workflow/status/sinedied/working-with-ai/deploy.yml?style=flat-square&label=deploy)](https://github.com/sinedied/working-with-ai/actions/workflows/deploy.yml)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

[Try the Quiz](https://sinedied.github.io/working-with-ai/) · [How It Works](#how-it-works) · [Development](#development) · [Research Data](#research-data)

</div>

An interactive quiz that estimates how applicable today's AI tools are to your occupation. Answer 10 questions about the nature of your work and get a score based on real usage data from **787 US occupations**.

Built on research from the paper ["Working with AI: Measuring the Applicability of Generative AI to Occupations"](https://arxiv.org/abs/2507.07935) by Tomlinson et al. (Microsoft Research, 2025), which analyzed Bing Copilot consumer usage data (Jan–Sep 2024).

## How It Works

The quiz asks 10 questions about work characteristics — writing, research, physical labor, data analysis, and more. Each answer is weighted and combined into an **AI Applicability Score** (0–100) that approximates the paper's methodology:

- **Positive dimensions** (writing, translation, research, data analysis) → higher score
- **Inverse dimensions** (physical labor, precision handwork) → lower score
- Final score normalized to match the paper's 0–0.50 range, displayed as 0–100

The result includes:
- 📊 **AI Applicability Score** with animated gauge
- 🗓️ **Estimated replacement timeline** based on [Metaculus community forecasts](https://www.metaculus.com/questions/5121/date-of-artificial-general-intelligence/)
- 🔍 **Similar occupations** and a searchable explorer of all 787 occupations

> [!NOTE]
> The quiz provides an estimate for informational purposes — not a prediction of job displacement.

## Research Data

The `paper/` directory contains the original research data and methodology from the Microsoft Research paper. See [paper/README.md](paper/README.md) for detailed file descriptions, metric definitions, and code to compute AI applicability scores.
