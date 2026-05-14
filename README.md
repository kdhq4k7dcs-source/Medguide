# MedGuide 医路指引

AI 驱动的初步分诊与就医导航助手。输入症状描述后，系统自动提取关键信息、检测危险信号、进行鉴别诊断并推荐合适的就诊科室。

**线上体验：** [medguide-dusky.vercel.app](https://medguide-dusky.vercel.app)

> 本产品仅供就医参考，**不提供医学诊断**。如有紧急情况请立即拨打 120。

## 功能

- **症状提取** — 从自然语言中解析症状部位、性质、持续时间、强度等结构化信息
- **危险信号识别** — 检测需要立即就医的紧急征象（卒中、心梗、急腹症等）
- **鉴别诊断** — 结合年龄、性别、基础疾病给出 3 个可能的疾病方向
- **严重程度评估** — 轻度 / 中度 / 重度分级并给出理由
- **科室推荐** — 基于中国三级医院科室标准推荐首选和备选就诊科室
- **追问引导** — 提供后续可补充的信息方向，最多 3 轮追问
- **适老化设计** — 大字体、高对比度、微软雅黑字体，方便老年用户使用

## 技术栈

| 层 | 技术 |
|------|------|
| 框架 | Next.js 15 (App Router) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS 4 |
| AI 模型 | DeepSeek Chat API |
| 数据校验 | Zod |
| 部署 | Vercel |

## 架构

```
用户输入 → 信息收集弹窗 → 症状描述
                              ↓
                    ┌─ P1 症状提取 ────┐
                    └─ P2 危险信号检测 ─┘  (并发)
                              ↓
                    有危险信号？──→ 紧急警告，对话终止
                        │ 无
                        ↓
                    P4 鉴别诊断推理
                        ↓
                    严重程度 + 疾病分析 + 科室推荐
                        ↓
                    追问补充信息(最多3轮)
```

### Pipeline 说明

| 管线 | 角色 | 温度 |
|------|------|------|
| **P0** Demographics | 提取年龄、性别 | 0.1 |
| **P1** Symptom Extractor | 提取结构化症状，不做医学判断 | 0.3 |
| **P2** Red Flag Detector | 检测紧急危险信号（宁误报不漏报） | 0.3 |
| **P4** Medical Reasoning | 鉴别诊断 + 严重程度 + 科室推荐 | 0.5 |

## 本地运行

```bash
# 安装依赖
npm install

# 配置 DeepSeek API Key
# 创建 .env.local，写入：
#   DEEPSEEK_API_KEY=sk-your-key-here
#   DEEPSEEK_MODEL=deepseek-chat

# 启动开发服务器
npm run dev

# 打开 http://localhost:3000
```

## 项目结构

```
├── app/
│   ├── api/triage/route.ts    # 分诊 API
│   ├── globals.css            # 全局样式
│   ├── layout.tsx             # 根布局
│   └── page.tsx               # 主页面
├── components/
│   ├── DemographicsModal.tsx   # 信息收集弹窗
│   ├── cards/
│   │   ├── DepartmentRecommendation.tsx
│   │   ├── DiseaseList.tsx
│   │   ├── MedicalDisclaimer.tsx
│   │   ├── RedFlagAlert.tsx
│   │   ├── SeverityBadge.tsx
│   │   └── TriageResultCard.tsx
│   ├── chat/
│   │   ├── ChatContainer.tsx
│   │   ├── ChatInput.tsx
│   │   ├── MessageList.tsx
│   │   └── TurnLimitBanner.tsx
│   └── ui/
│       └── LoadingDots.tsx
└── lib/
    ├── deepseek.ts            # DeepSeek API 封装
    ├── types.ts               # 类型定义
    ├── validation.ts          # Zod Schema + 默认值
    └── pipelines/
        ├── prompts.ts         # 所有 System Prompt
        ├── p0-demographics.ts
        ├── p1-symptom-extractor.ts
        ├── p2-red-flag-detector.ts
        └── p4-medical-reasoning.ts
```

## License

MIT
