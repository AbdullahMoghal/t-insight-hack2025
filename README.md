# T-Insight

## Demo Video

[![T-Insight Demo](https://img.youtube.com/vi/4c7uRVxoJfc/maxresdefault.jpg)](https://www.youtube.com/watch?v=4c7uRVxoJfc)

## Overview

A comprehensive customer intelligence platform for T-Mobile that aggregates customer feedback from multiple sources, analyzes sentiment, and generates AI-powered actionable insights to improve customer experience.

## Features

### Dashboard
- **Customer Happiness Index (CHI)** - Real-time sentiment scoring across product areas
- **Emerging Issues Tracking** - Identify and prioritize critical customer issues
- **Product Area Analytics** - Deep dive into Network, Mobile App, Billing, and Home Internet metrics
- **Top Performers** - Track best-performing product areas
- **Early Warning System** - Proactive alerts for rising issues
- **Real-time Activity Feed** - Live customer signal monitoring
- **Sentiment Timeline** - Historical sentiment trends
- **Geographic Heatmap** - Visualize customer feedback by location

### AI-Powered Insights
- **Actionable Insights Generation** - AI-generated recommendations for emerging issues using Google Gemini
- **Product Area Recommendations** - Context-aware action items for each product area
- **PRD Generation** - Automated Product Requirements Document creation
- **User Stories Generation** - AI-generated user stories from customer signals

### Data Sources
- **Reddit** - r/tmobile and r/tmobileisp posts
- **Google News** - T-Mobile related news articles
- **DownDetector** - Network outage reports
- **IsTheServiceDown** - Service status monitoring
- **Outage.Report** - Outage tracking
- **Customer Feedback** - BestCompany.com reviews
- **T-Mobile Community** - Community discussions

### Opportunity Management
- **RICE Scoring** - Prioritize opportunities by Reach, Impact, Confidence, and Effort
- **Evidence Tracking** - Link customer signals to opportunities
- **PRD Management** - Generate and manage product requirements
- **User Story Mapping** - Create and track user stories

## Tech Stack

### Core Framework
- **Next.js 16.0.1**
- **React 19.2.0**
- **TypeScript 5**

### Database & Authentication
- **Supabase** - PostgreSQL database and authentication

### Generative AI
- **Google Gemini AI** - AI-powered insights generation
  - Model: `gemini-2.0-flash`
  - Used for: Insights generation, PRD creation, user stories, product area recommendations

### Web Scraping
- **Cheerio** - HTML parsing and DOM manipulation
  - Used for: IsTheServiceDown, Customer Feedback scraping
- **fast-xml-parser** - XML/RSS parsing
  - Used for: Google News RSS feeds
- **Native Fetch API** - HTTP requests for all scrapers

### Data Processing
- **wink-sentiment** - Sentiment analysis
- **keyword-extractor** - Keyword extraction from text

### UI Components
- **Radix UI** - Accessible component primitives
  - Dialog, Dropdown Menu, Select, Label, Separator, Collapsible
- **Tailwind CSS 4** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Recharts** - Chart library for data visualization
- **Sonner** - Toast notifications

### Maps & Visualization
- **Leaflet** - Interactive maps
- **React Leaflet** - React bindings for Leaflet
- **leaflet.heat** - Heatmap layer for Leaflet

### Utilities
- **date-fns** - Date manipulation
- **zod** - Schema validation
- **clsx** - Conditional class names
- **tailwind-merge** - Merge Tailwind classes
- **class-variance-authority** - Component variants

## APIs & External Services

### Google Gemini AI
- **Purpose**: Generate actionable insights, PRDs, user stories, and recommendations
- **Model**: `gemini-2.0-flash`

### Supabase
- **Purpose**: Database, authentication, and real-time subscriptions
- **Services Used**:
  - PostgreSQL database
  - Authentication (email/password)

### Data Sources (Scraped)
- **Reddit** - JSON API endpoints for r/tmobile and r/tmobileisp
- **Google News** - RSS feeds
- **DownDetector** - Static data files
- **IsTheServiceDown** - HTML scraping
- **Outage.Report** - HTML scraping
- **BestCompany.com** - HTML scraping
