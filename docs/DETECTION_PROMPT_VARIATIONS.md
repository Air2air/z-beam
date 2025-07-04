# Detection Prompt Variation System 🎭

## Overview

The Z-Beam system now includes a sophisticated **prompt variation system** that automatically rotates between different detection prompts to improve robustness and avoid overfitting to a single prompt style.

## ✅ Key Improvements Made

### 1. Active Detection Prompt Logging
- **✅ Visible in logs**: Each detection shows which prompt variation is being used
- **✅ Iteration tracking**: Logs show `Using AI detection prompt variation: ai_detection_v2 (iteration 3)`
- **✅ Performance tracking**: System tracks success rates of different prompt variations

### 2. Higher Iteration Counts  
- **✅ USER_CONFIG**: `iterations_per_section=5` (configurable in run.py)
- **✅ Test defaults**: Quick test = 4 iterations, Comprehensive test = 5 iterations
- **✅ CLI default**: `--max-iterations` default increased from 3 → 5
- **✅ Documentation**: Clear comments explaining why higher iterations help

### 3. Different Variation on Each Iteration
- **✅ Strategic rotation**: Each iteration uses a different prompt variation
- **✅ Intelligent selection**: 
  - Iteration 1: Random variation for diversity
  - Iteration 2: Specific v1 variation  
  - Iteration 3+: Rotate through all available variations
- **✅ Performance tracking**: System learns which prompts work best

## 🎭 Available Prompt Variations

### AI Detection Prompts (5 variations)
1. `ai_detection_prompt_minimal` - Simple, direct
2. `ai_detection_v1` - Basic likelihood rating
3. `ai_detection_v2` - Focus on formal tone and structure
4. `ai_detection_v3` - Emphasis on machine-generated signs
5. `ai_detection_v4` - Natural vs artificial assessment

### Human Detection Prompts (5 variations)  
1. `human_detection_prompt_minimal` - Over-human exaggeration focus
2. `human_detection_v1` - "Trying too hard" assessment
3. `human_detection_v2` - Artificial casualness detection
4. `human_detection_v3` - Performative authenticity focus
5. `human_detection_v4` - Forced human-like elements

## 🔧 Configuration in run.py

```python
# ---- CONFIGURATION (edit here) ----
# Higher iterations_per_section (5-10) allows testing more prompt variations
# and gives the system more chances to reach your target thresholds.
# Each iteration uses a different detection prompt variation for robustness.
USER_CONFIG = dict(
    material="Silver",
    category="Material", 
    file_name="laser_cleaning_silver.mdx",
    generator_provider="GEMINI",
    detection_provider="DEEPSEEK",
    author="todd_dunning.mdx",
    temperature=1,
    force_regenerate=True,
    ai_detection_threshold=50,  # Target AI-likelihood score (lower = more human-like)
    human_detection_threshold=50,  # Target over-human score (lower = less try-hard)  
    iterations_per_section=5,  # Max iterations to improve content (more = better but slower)
)
```

## 🚀 Usage Examples

### Regular Article Generation
```bash
python run.py  # Uses iterations_per_section=5 from USER_CONFIG
```

### Quick Test (4 iterations)
```bash
python run.py --test
```

### Comprehensive Test (5 iterations)
```bash  
python run.py --test-comprehensive
```

### Custom Test with Higher Iterations
```bash
python run.py --test-custom --material=copper --max-iterations=8
```

## 📊 Benefits

### Robustness
- **Avoid overfitting**: Different prompts prevent the system from learning to fool a single detector
- **Diverse perspectives**: Each prompt variation looks for different AI/human characteristics
- **Better coverage**: More iterations = more chances to hit target thresholds

### Observability
- **Visible prompt usage**: Logs show exactly which prompt is being used each iteration
- **Performance tracking**: System learns which prompts work best over time
- **Better debugging**: Can see if specific prompts are causing issues

### Flexibility
- **Easy configuration**: Change `iterations_per_section` in run.py
- **CLI override**: Use `--max-iterations` for one-off tests
- **Scalable**: Easy to add more prompt variations

## 🧪 Test Results

Example output showing prompt variation in action:

```
🔄 Iteration 1:
Using AI detection prompt variation: ai_detection_v3 (iteration 1)
   🤖 AI Detection Score: 85%

🔄 Iteration 2:  
Using AI detection prompt variation: ai_detection_v1 (iteration 2)
   🤖 AI Detection Score: 90%

🔄 Iteration 3:
Using AI detection prompt variation: ai_detection_v2 (iteration 3)  
   🤖 AI Detection Score: 95%
```

## 📈 Performance Tracking

The system automatically tracks which prompts perform best:

```
📊 Prompt Performance Summary:
   ai_detection_v1_ai:
      Uses: 2
      Avg Score: 87.5%
      Success Rate: 100.0%
   ai_detection_v2_ai:  
      Uses: 1
      Avg Score: 95.0%
      Success Rate: 100.0%
```

## 🎯 Recommendations

### For Regular Use
- **Set `iterations_per_section=5-8`** in run.py for good coverage
- **Monitor logs** to see which prompts are being used
- **Check performance data** to identify best-performing variations

### For Testing
- **Use `--max-iterations=5+`** to test multiple prompt variations
- **Try different materials** to see how prompts perform across content types
- **Experiment with thresholds** to find optimal settings

### For Optimization
- **Add new prompt variations** by creating new `.txt` files in `/generator/prompts/detection/`
- **Adjust rotation strategy** in `get_optimal_prompt()` method
- **Track performance data** to identify and remove ineffective prompts

## ✅ Status

**The prompt variation system is fully operational and ready for production use!**

- ✅ 5 AI detection prompt variations
- ✅ 5 Human detection prompt variations  
- ✅ Strategic rotation across iterations
- ✅ Performance tracking and logging
- ✅ Configurable iteration counts
- ✅ Comprehensive test coverage

This system provides much more robust AI detection and significantly reduces the chance of overfitting to any single prompt style.
