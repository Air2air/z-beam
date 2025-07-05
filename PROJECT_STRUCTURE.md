# Z-Beam Project Structure

This is a Next.js website with an integrated Python-based content generator.

## 📁 Project Structure

```
/
├── app/                    # Next.js application
├── public/                 # Next.js static assets
├── docs/                   # Documentation
├── generator/              # Python content generation system
│   ├── core/              # Domain models and business logic
│   ├── modules/           # Application modules
│   ├── config/            # Configuration management
│   ├── infrastructure/    # External integrations
│   ├── cache/             # Generated content cache
│   ├── prompts/           # AI prompt templates
│   ├── detection/         # Detection prompts and settings
│   ├── sections/          # Section configuration
│   ├── logs/              # Application logs
│   ├── main.py           # Generator main entry point
│   ├── interactive_training.py  # Training interface
│   └── test_runner.py    # Test utilities
├── run.py                  # User configuration file
├── package.json           # Next.js dependencies
└── [Next.js config files] # Standard Next.js setup
```

## 🚀 Usage

### Running the Content Generator

```bash
# Generate content with current configuration
python3 run.py

# Test the detection system
python3 run.py --test-detector
```

### Training the Detection System

```bash
# Run interactive training from the generator directory
cd generator
python3 interactive_training.py
```

### Running the Next.js Website

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## ⚙️ Configuration

All user configuration is in the root `run.py` file:

- **Material settings**: What material to generate content for
- **Provider settings**: Which AI provider to use (GEMINI, XAI, DEEPSEEK)
- **Detection thresholds**: AI detection and natural voice thresholds
- **Temperature settings**: Fine-tune AI creativity levels

## 🏗️ Architecture

- **Separation of Concerns**: Next.js website and Python generator are clearly separated
- **Clean Configuration**: All user settings in one place (`run.py`)
- **Modular Design**: Generator uses dependency injection and clean architecture
- **Path Management**: Automatic path setup handles imports between directories

## 🔧 Development

The generator package is self-contained within the `/generator` directory and can be developed independently of the Next.js application.
