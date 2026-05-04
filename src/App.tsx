/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, FormEvent } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Sparkles, 
  Download, 
  Eye, 
  Edit3, 
  Image as ImageIcon, 
  Trash2,
  Package,
  Store,
  Zap,
  ChevronRight,
  Info,
  Loader2,
  Copy,
  Check
} from 'lucide-react';

interface ListingData {
  storeName: string;
  title: string;
  description: string;
  keywords: string;
  images: { url: string; caption: string }[];
  highlights: { text: string; icon: string }[];
  specifications: { key: string; value: string }[];
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [data, setData] = useState<ListingData>({
    storeName: 'BazMart',
    title: '',
    description: '',
    keywords: '',
    images: [],
    highlights: [],
    specifications: []
  });
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isImproving, setIsImproving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isOptimizingTitle, setIsOptimizingTitle] = useState(false);
  const [isGeneratingExtras, setIsGeneratingExtras] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
    const words = text.split(' ');
    let line = '';
    let count = 0;
    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + ' ';
      if (ctx.measureText(testLine).width > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
        count++;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
    count++;
    return count;
  };

  const handleImageAction = (action: 'download' | 'copy') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#002142';
    ctx.fillRect(0, 0, 1200, 1200);

    // Header Block
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(0, 0, 1200, 180);

    // Store Name
    ctx.fillStyle = '#002142';
    ctx.font = 'bold 80px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText((data.storeName || 'STORE').toUpperCase(), 600, 110);

    ctx.font = 'bold 30px sans-serif';
    ctx.fillText("PRODUKT-HIGHLIGHTS", 600, 155);

    // Product Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    wrapText(ctx, data.title || 'Produkttitel', 600, 280, 1050, 60);

    // Points
    const points = data.description.split('\n').filter(p => p.trim());
    ctx.textAlign = 'left';
    let currentY = 520;
    points.forEach((point) => {
        if (currentY > 1050) return;
        ctx.fillStyle = '#ffcc00';
        ctx.fillRect(80, currentY - 45, 60, 60);
        ctx.fillStyle = '#002142';
        ctx.font = 'bold 45px sans-serif';
        ctx.fillText("✓", 92, currentY);

        ctx.fillStyle = '#ffffff';
        ctx.font = '500 38px sans-serif';
        const lines = wrapText(ctx, point.replace(/^[•\s*-]+/, '').trim(), 190, currentY, 900, 50);
        currentY += (lines * 50) + 40;
    });

    // Footer
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(0, 1100, 1200, 100);
    ctx.fillStyle = '#ffcc00';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("✓ ORIGINALWARE  ✓ BLITZVERSAND  ✓ TOP SERVICE", 600, 1165);

    if (action === 'download') {
      const link = document.createElement('a');
      link.download = `${data.storeName.replace(/\s+/g, '-')}-Listing.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } else {
      canvas.toBlob(blob => {
        if (!blob) return;
        const item = new ClipboardItem({ "image/png": blob });
        navigator.clipboard.write([item]).then(() => {
          alert("Image Copied to Clipboard!");
        }).catch(err => {
          console.error("Copy failed", err);
          alert("Copy failed: " + err);
        });
      });
    }
  };

  const downloadPortableTool = () => {
    const portableHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hashir AI Lister - Enterprise v4.0</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #020617; color: #f8fafc; }
        .input-dark { background: #0f172a; border: 1px solid #1e293b; color: #fff; border-radius: 8px; padding: 10px 14px; transition: all 0.2s; }
        .input-dark:focus { border-color: #4f46e5; outline: none; box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2); }
        .preview-container { 
            display: flex; 
            justify-content: center; 
            align-items: flex-start; 
            background: #0f172a; 
            padding: 40px 20px;
            min-height: 100%;
        }
        .ebay-preview-wrapper { 
            width: 100%; 
            max-width: 900px; 
            background: #ffffff; 
            color: #1a202c; 
            border-radius: 8px; 
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
            overflow: hidden;
        }
        .loading-spinner { border: 3px solid rgba(255, 255, 255, 0.1); border-top: 3px solid #4f46e5; border-radius: 50%; width: 20px; height: 20px; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body x-data="generator()" class="overflow-hidden h-screen">
    <div class="h-full flex flex-col lg:flex-row">
        <!-- Sidebar -->
        <div class="lg:w-2/5 xl:w-1/4 bg-[#020617] p-6 border-r border-slate-800 overflow-y-auto">
            <div class="flex items-center gap-3 mb-8">
                <div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <div>
                    <h1 class="text-lg font-bold text-white">Hashir AI Lister</h1>
                    <p class="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Ultimate SEO v4.0</p>
                </div>
            </div>

            <div class="space-y-5">
                <div>
                    <label class="block text-[10px] font-bold text-slate-500 uppercase mb-2">Gemini API Key</label>
                    <input x-model="apiKey" type="password" placeholder="Paste your key here..." class="w-full input-dark text-xs">
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-slate-500 uppercase mb-2">Amazon Product Data</label>
                    <textarea x-model="rawInput" rows="4" placeholder="Paste Amazon title & details..." class="w-full input-dark text-sm"></textarea>
                </div>

                <button @click="processWithAI()" :disabled="loading" class="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                    <template x-if="loading"><div class="loading-spinner"></div></template>
                    <span x-text="loading ? 'Generating SEO...' : '1. Generate SEO Listing'"></span>
                </button>

                <div class="pt-4 border-t border-slate-800 space-y-4">
                    <div>
                        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Store Name</label>
                        <input x-model="storeName" type="text" class="w-full input-dark text-sm">
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">AI-Optimized eBay Title (Unlimited Length)</label>
                        <input x-model="title" type="text" class="w-full input-dark text-sm font-bold text-indigo-400">
                        <p class="text-[9px] text-slate-400 mt-1">This title is AI-crafted for maximum sales performance.</p>
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">German Key Features</label>
                        <textarea x-model="description" rows="5" class="w-full input-dark text-sm"></textarea>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3 pt-2">
                    <button @click="handleImage('copy')" class="bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl text-[10px] transition-all active:scale-95">COPY IMAGE</button>
                    <button @click="handleImage('download')" class="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl text-[10px] transition-all active:scale-95">SAVE IMAGE</button>
                </div>
                <button @click="copyToClipboard()" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs transition-all active:scale-95">COPY EBAY HTML CODE</button>
                <button @click="downloadSelf()" class="w-full bg-blue-600/10 text-blue-400 font-bold py-2 rounded-xl text-[10px] transition-all active:scale-95 border border-blue-600/20 mt-4">CLONE PORTABLE TOOL</button>
            </div>
        </div>

        <!-- Preview Area -->
        <div class="flex-1 bg-[#0f172a] overflow-y-auto">
            <div class="preview-container">
                <div class="ebay-preview-wrapper">
                    <div x-html="generateHTML()"></div>
                </div>
            </div>
        </div>
    </div>

    <script>
        function generator() {
            return {
                apiKey: '',
                rawInput: '',
                loading: false,
                storeName: '${data.storeName}',
                title: 'Example Product Title',
                description: '• Premium Quality\\n• Fast Shipping from Germany',
                images: [{url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800', caption: 'Product View'}],

                async processWithAI() {
                    if (!this.apiKey) return alert("Please enter your Gemini API Key.");
                    if (!this.rawInput) return alert("Please paste product data first.");
                    
                    this.loading = true;
                    const prompt = \`Act as an expert German eBay SEO Manager. 
                                   From the input below, extract the MOST IMPORTANT keywords that German customers use on eBay.
                                   Rules:
                                   1. Generate an eBay title that is approximately 80 words long.
                                   2. Include priority keywords (Brand, Product Name, Size, Key Feature).
                                   3. Provide 5-6 clear bullet points in German.
                                   Input: \${this.rawInput}
                                   Response ONLY in JSON: {"title": "...", "description": "..."}\`;

                    try {
                        const response = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=\${this.apiKey}\`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                        });
                        const data = await response.json();
                        const text = data.candidates[0].content.parts[0].text;
                        const jsonStr = text.replace(/\\\`\\\`\\\`json|\\\`\\\`\\\`/g, '').trim();
                        const result = JSON.parse(jsonStr);
                        this.title = result.title;
                        this.description = result.description;
                    } catch (e) { 
                        console.error(e);
                        alert("AI Error. Please check your API Key and internet connection."); 
                    } finally { 
                        this.loading = false; 
                    }
                },

                generateHTML() {
                    const benefits = this.description.split('\\n').filter(l => l.trim()).map(line => \`
                        <li style="margin-bottom: 8px; padding-left: 20px; position: relative;">
                            <span style="position: absolute; left: 0; color: #ffcc00; font-weight: bold;">✓</span> \${line.replace(/^[•\\\\s*-]+/, '')}
                        </li>
                    \`).join('');

                    return \`
                        <div style="font-family: 'Inter', sans-serif; background: #fff; border: 1px solid #e2e8f0;">
                            <div style="background: #002142; padding: 40px 20px; text-align: center; border-bottom: 5px solid #ffcc00;">
                                <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: 900; text-transform: uppercase;">\${this.storeName}</h1>
                                <p style="color: #ffcc00; font-size: 10px; font-weight: bold; letter-spacing: 3px; margin-top: 5px;">QUALITÄTS-SHOP • BLITZVERSAND</p>
                            </div>
                            <div style="padding: 30px; text-align: center;">
                                <h2 style="font-size: 24px; font-weight: 800; line-height: 1.2; color: #1a202c; max-width: 700px; margin: 0 auto 15px;">\${this.title}</h2>
                                <p style="background: #f0f4f8; padding: 6px 20px; border-radius: 50px; display: inline-block; font-size: 13px; font-weight: bold; color: #002142;">Zertifizierter Fachhändler | Standort Deutschland</p>
                                
                                <div style="margin: 30px auto; max-width: 500px; border: 1px solid #edf2f7; padding: 8px; background: #fff;">
                                    <img src="\${this.images[0].url}" style="width: 100%; height: auto; display: block;">
                                </div>

                                <div style="text-align: left; margin: 30px auto 0; max-width: 650px; border-left: 5px solid #ffcc00; padding: 20px; background: #f8fafc;">
                                    <h3 style="color: #002142; margin: 0 0 15px 0; font-size: 18px; font-weight: 800; text-transform: uppercase;">Ihre Vorteile auf einen Blick</h3>
                                    <ul style="list-style: none; padding: 0; margin: 0; font-size: 15px; line-height: 1.6;">
                                        \${benefits}
                                    </ul>
                                </div>
                            </div>
                            <div style="background: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 11px; border-top: 1px solid #e2e8f0;">
                                © 2026 \${this.storeName} Official Store. Schneller Versand aus Deutschland. ✅
                            </div>
                        </div>\`;
                },

                copyToClipboard() {
                    const el = document.createElement('textarea');
                    el.value = this.generateHTML();
                    document.body.appendChild(el);
                    el.select();
                    document.execCommand('copy');
                    document.body.removeChild(el);
                    alert("eBay HTML Code successfully copied!");
                },
                
                downloadSelf() {
                    const blob = new Blob([document.documentElement.outerHTML], {type: 'text/html'});
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = 'Hashir_Enterprise_Lister.html';
                    a.click();
                }
            }
        }
    </script>
</body>
</html>`;

    const blob = new Blob([portableHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Hashir-Enterprise-Lister-${data.storeName.replace(/\s+/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    const html = generateHTML();
    navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      setData(prev => ({ 
        ...prev, 
        images: [...prev.images, { url: newImageUrl.trim(), caption: 'Product Feature' }] 
      }));
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const updateImageCaption = (index: number, caption: string) => {
    setData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? { ...img, caption } : img)
    }));
  };

  const addHighlight = () => {
    setData(prev => ({ ...prev, highlights: [...prev.highlights, { text: '', icon: '✦' }] }));
  };

  const updateHighlight = (index: number, text: string, icon?: string) => {
    setData(prev => ({
      ...prev,
      highlights: prev.highlights.map((h, i) => i === index ? { text, icon: icon || h.icon } : h)
    }));
  };

  const removeHighlight = (index: number) => {
    setData(prev => ({ ...prev, highlights: prev.highlights.filter((_, i) => i !== index) }));
  };

  const addSpec = () => {
    setData(prev => ({ ...prev, specifications: [...prev.specifications, { key: '', value: '' }] }));
  };

  const updateSpec = (index: number, key: string, value: string) => {
    setData(prev => ({
      ...prev,
      specifications: prev.specifications.map((s, i) => i === index ? { key, value } : s)
    }));
  };

  const removeSpec = (index: number) => {
    setData(prev => ({ ...prev, specifications: prev.specifications.filter((_, i) => i !== index) }));
  };

  const autoGenerateExtras = async () => {
    if (!data.description.trim() && !data.title.trim()) return;
    setIsGeneratingExtras(true);
    try {
      const prompt = `Handeln Sie als KI-Kern einer professionellen eBay-Listing-Software. Analysieren Sie diese Produktinformationen und geben Sie alle Ausgaben STRENG auf DEUTSCH (German) aus:
      Titel: ${data.title}
      Beschreibung: ${data.description}
      Anzahl der Bilder: ${data.images.length}

      Generieren Sie basierend darauf:
      1. 5-6 professionelle deutsche Highlights. Jedes Highlight muss aus einem kurzen Text (max 60 Zeichen) und einem passenden, relevanten Icon-Symbol (ein einzelnes Zeichen oder Emoji, z.B. 🛡️, ⚡, ⚙️, 📦, 💎) bestehen. WICHTIG: Verwenden Sie KEINE Markdown-Symbole wie Sternchen (*) oder Doppel-Sterne (**). Nur reinen Text.
      2. Eine technische Spezifikationstabelle (mindestens 4-5 Einträge).
      3. Eine optimierte Liste von 15-20 hochrelevanten, suchvolumenstarken deutschen SEO-Keywords (Short-Tail & Long-Tail), getrennt durch Kommas.
      4. Verkaufspsychologische deutsche Bildunterschriften für alle ${data.images.length} Bilder. 
         Format: "[Konkreter Nutzen oder wichtiges Detail]". 
         WICHTIG: Keine generischen Texte wie "Produktbild". Beschreiben Sie stattdessen, was der Käufer sieht oder warum dieses Detail wichtig ist (z.B. "Ergonomische Form für ermüdungsfreies Arbeiten" oder "Präzisionsgefertigte Anschlüsse für verlustfreie Signalübertragung").

      Entfernen Sie Hype-Wörter.
      Formatieren Sie die Antwort als gültiges JSON-Objekt mit "highlights" (Array von Objekten mit "text" und "icon"), "specifications" (Array von {key, value}), "keywords" (String) und "captions" (Array von strings).
      Return ONLY the JSON.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });

      const text = response.text;
      if (text) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setData(prev => ({
            ...prev,
            highlights: parsed.highlights || prev.highlights,
            specifications: parsed.specifications || prev.specifications,
            keywords: parsed.keywords || prev.keywords,
            images: prev.images.map((img, i) => ({
              ...img,
              caption: (parsed.captions && parsed.captions[i]) ? parsed.captions[i] : img.caption
            }))
          }));
        }
      }
    } catch (error) {
      console.error("Error generating extras:", error);
    } finally {
      setIsGeneratingExtras(false);
    }
  };

  const improveDescription = async () => {
    if (!data.description.trim()) return;
    setIsImproving(true);
    try {
      const prompt = `Handeln Sie als KI-Experte für eBay-Angebote. Verbessern Sie die folgende Produktbeschreibung auf DEUTSCH.
      
      Strenge Regeln:
      - Überzeugend, professionell und SEO-optimiert.
      - Entfernen Sie Hype-Wörter (wie 'Beste', 'Billig', 'Authentisch') und ersetzen Sie diese durch seriöse, fachliche Alternativen.
      - Behalten Sie alle Fakten und Details bei.
      
      Geben Sie NUR den verbesserten Beschreibungstext zurück.\n\nBeschreibung: ${data.description}`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });

      const text = response.text;
      if (text) {
        setData(prev => ({ ...prev, description: text }));
      }
    } catch (error) {
      console.error("Error improving description:", error);
    } finally {
      setIsImproving(false);
    }
  };

  const optimizeTitle = async () => {
    if (!data.title.trim()) return;
    setIsOptimizingTitle(true);
    try {
      const prompt = `Act as an expert German eBay SEO Manager. Rewrite and expand this product title for maximum search visibility. The output should be approximately 80 words long. Geben Sie NUR den optimierten Titel zurück.\n\nTitel: ${data.title}`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });

      const text = response.text;
      if (text) {
        setData(prev => ({ ...prev, title: text.substring(0, 80) }));
      }
    } catch (error) {
      console.error("Error optimizing title:", error);
    } finally {
      setIsOptimizingTitle(false);
    }
  };

  const generateHTML = () => {
    const storeName = data.storeName || "BazMart";
    const processText = (text: string) => {
        // Robust markdown cleanup: handle bold and strip all remaining stars/backticks/hashes
        return text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                   .replace(/[\*_`#]/g, '')
                   .trim();
    };

    const renderFeatureImage = (img: { url: string, caption: string }) => `
        <div class="feature-image-box">
            <img src="${img.url}" alt="Detailsicht">
            <div class="feature-caption">${processText(img.caption)}</div>
        </div>
    `;

    // Divide remaining images between sections
    const secondaryImages = data.images.slice(1);
    const splitPoint = Math.ceil(secondaryImages.length / 2);
    const descImages = secondaryImages.slice(0, splitPoint);
    const specImages = secondaryImages.slice(splitPoint);

    return `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root { 
            --gold: #ffcc00; 
            --navy: #002142; 
            --white: #ffffff;
            --text-main: #1a202c;
        }
        body { font-family: 'Inter', sans-serif; line-height: 1.4; color: var(--text-main); background: #f4f7f6; min-height: 100vh; }
        .wrapper { max-width: 880px; margin: 10px auto; background: var(--white); border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); position: relative; }
        
        .header { background: var(--navy); padding: 30px 20px; text-align: center; border-bottom: 5px solid var(--gold); }
        .header-badge { display: inline-block; border: 2px solid var(--gold); padding: 8px 30px; border-radius: 4px; background: rgba(255,255,255,0.03); }
        .header-badge h1 { margin: 0; color: var(--white); font-size: 28px; letter-spacing: 2px; text-transform: uppercase; font-weight: 900; }
        .header-badge p { margin: 2px 0 0; color: var(--gold); font-size: 10px; letter-spacing: 4px; font-weight: bold; }
        .header-tagline { margin-top: 10px; color: var(--white); font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; opacity: 0.85; }

        .container { padding: 25px; position: relative; background: #ffffff; }
        .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-35deg); font-size: 55px; font-weight: 900; color: rgba(0,0,0,0.02); white-space: nowrap; pointer-events: none; z-index: 0; text-transform: uppercase; }
        .content { position: relative; z-index: 1; }

        .product-header { text-align: center; margin-bottom: 20px; }
        .product-header h2 { color: #000; font-size: 24px; font-weight: 800; margin-bottom: 8px; line-height: 1.2; }
        .product-header p { color: var(--navy); font-size: 14px; font-weight: 700; background: #f0f4f8; padding: 5px 15px; border-radius: 50px; display: inline-block; }
        
        .main-image-container { margin: 20px auto; max-width: 480px; border: 1px solid #edf2f7; padding: 6px; background: #fff; }
        .main-image { width: 100%; height: auto; display: block; border-radius: 1px; }

        .section-title { color: var(--navy); border-bottom: 2px solid var(--gold); padding-bottom: 6px; margin: 25px 0 15px; font-size: 20px; font-weight: 800; text-transform: uppercase; }
        
        .solid-card { background: #ffffff; border-radius: 4px; border: 1px solid #cbd5e0; padding: 20px; margin-bottom: 20px; }
        
        .highlights-list { list-style: none; }
        .highlights-list li { margin-bottom: 10px; font-size: 15px; color: #1a202c; font-weight: 500; position: relative; padding-left: 42px; border-bottom: 1px solid #edf2f7; padding-bottom: 10px; display: flex; align-items: center; min-height: 30px; }
        .highlights-list li:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
        .highlight-icon { position: absolute; left: 0; color: var(--gold); background: var(--navy); width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 4px; font-size: 14px; font-weight: 900; }

        .description-text { font-size: 15px; line-height: 1.5; color: #1a202c; }
        .benefit-item { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 6px; padding: 10px 12px; border-left: 4px solid var(--gold); background: #f8fafc; border-radius: 0 4px 4px 0; }
        .benefit-icon { color: var(--navy); font-weight: bold; font-size: 16px; line-height: 1; }

        .feature-image-box { margin: 15px 0; border: 1px solid #edf2f7; border-radius: 4px; overflow: hidden; background: #fff; }
        .feature-image-box img { width: 100%; height: auto; display: block; }
        .feature-caption { padding: 10px; background: var(--navy); color: var(--gold); font-size: 12px; font-weight: 700; text-align: center; border-top: 2px solid var(--gold); }

        .gallery { display: none; }
        .image-card { background: var(--white); border: 1px solid #cbd5e0; padding: 10px; border-radius: 4px; text-align: center; }
        .image-card img { width: 100%; height: auto; display: block; border-radius: 2px; }
        .image-card-caption { font-size: 12px; font-weight: 700; color: var(--navy); margin-top: 10px; padding: 8px; background: #edf2f7; border-radius: 2px; }

        .specs-table { width: 100%; border-collapse: collapse; margin: 10px 0; border: 1px solid #cbd5e0; }
        .specs-table td { padding: 12px 15px; border-bottom: 1px solid #cbd5e0; font-size: 14px; color: #1a202c; }
        .specs-table tr:last-child td { border-bottom: none; }
        .specs-table tr td:first-child { font-weight: 800; width: 35%; color: var(--navy); background: #f7fafc; border-right: 1px solid #cbd5e0; text-transform: uppercase; font-size: 11px; }

        .trust-section { background: var(--navy); border-radius: 8px; padding: 40px 25px; margin-top: 40px; color: #ffffff; }
        .trust-badge { text-align: center; margin-bottom: 30px; }
        .trust-badge span { background: var(--gold); color: var(--navy); padding: 8px 35px; border-radius: 4px; font-weight: 900; font-size: 15px; text-transform: uppercase; }
        
        .trust-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 25px; text-align: center; }
        .trust-item h4 { margin: 10px 0 5px; color: var(--gold); font-size: 18px; font-weight: 800; }
        .trust-item p { font-size: 14px; color: #e2e8f0; line-height: 1.4; }

        .service-note { margin-top: 30px; padding: 20px; border: 2px dashed var(--gold); border-radius: 6px; background: rgba(255, 204, 0, 0.05); }
        .service-note h4 { color: var(--gold); margin-bottom: 8px; font-size: 16px; font-weight: 900; text-transform: uppercase; }
        .service-note p { font-size: 14px; color: #ffffff; font-weight: 500; line-height: 1.5; }

        .footer { background: #f1f5f9; text-align: center; padding: 30px 20px; font-size: 13px; color: #4a5568; border-top: 1px solid #cbd5e0; }
        .footer strong { color: var(--navy); }
        .footer .seo-tags { margin-top: 20px; color: #718096; border: 1px solid #cbd5e0; padding: 12px; background: #ffffff; border-radius: 4px; font-style: italic; font-size: 11px; line-height: 1.4; text-align: justify; }
        .footer .seo-tags strong { color: #a0aec0; text-transform: uppercase; letter-spacing: 1px; font-size: 10px; display: block; margin-bottom: 5px; }

        @media (max-width: 768px) {
            .wrapper { margin: 0; border-radius: 0; border: none; width: 100%; max-width: 100%; }
            .container { padding: 15px; }
            .main-image-container { max-width: 100%; border: none; padding: 0; margin: 15px 0; }
            .gallery { grid-template-columns: 1fr; gap: 12px; }
            .trust-grid { grid-template-columns: 1fr; gap: 20px; }
            .header-badge { width: 95%; padding: 10px; }
            .solid-card { padding: 15px; }
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="watermark">${storeName}</div>
        
        <div class="header">
            <div class="header-badge">
                <h1>${storeName}</h1>
                <p>QUALITÄTS-SHOP</p>
            </div>
            <div class="header-tagline">Exzellenter Service | Geprüfte Originalware</div>
        </div>

        <div class="container">
            <div class="content">
                <div class="product-header">
                    <h2>${processText(data.title || '[Produkttitel]')}</h2>
                    <p>Zertifizierter Fachhändler | Blitzversand</p>
                    ${data.images.length > 0 ? `<div class="main-image-container"><img src="${data.images[0].url}" class="main-image" alt="Produktbild"></div>` : ''}
                </div>

                ${data.highlights.length > 0 ? `
                <div class="highlights-section solid-card">
                    <h3 class="section-title">Highlights</h3>
                    <ul class="highlights-list">
                        ${data.highlights.map(h => `
                            <li>
                                <div class="highlight-icon">${h.icon || '✓'}</div>
                                ${processText(h.text)}
                            </li>
                        `).join('')}
                    </ul>
                </div>
                ` : ''}

                <div class="description-section solid-card">
                    <h3 class="section-title">Beschreibung</h3>
                    <div class="description-text">
                        ${data.description.split('\n').filter(line => line.trim()).map(line => `
                            <div class="benefit-item">
                                <div class="benefit-icon">»</div>
                                <div>${processText(line.trim())}</div>
                            </div>
                        `).join('')}
                    </div>
                    ${descImages.map(img => renderFeatureImage(img)).join('')}
                </div>

                ${data.specifications.length > 0 ? `
                <div class="specs-section solid-card">
                    <h3 class="section-title">Details</h3>
                    <table class="specs-table">
                        ${data.specifications.map(s => `
                        <tr>
                            <td>${processText(s.key)}</td>
                            <td>${processText(s.value)}</td>
                        </tr>
                        `).join('')}
                    </table>
                    ${specImages.map(img => renderFeatureImage(img)).join('')}
                </div>
                ` : ''}

                <div class="trust-section">
                    <div class="trust-badge"><span>WARUM ${storeName.toUpperCase()}?</span></div>
                    <div class="trust-grid">
                        <div class="trust-item">
                            <div style="font-size: 36px">🛡️</div>
                            <h4>Originalware</h4>
                            <p>Wir garantieren die Echtheit jedes Produkts.</p>
                        </div>
                        <div class="trust-item">
                            <div style="font-size: 36px">🕒</div>
                            <h4>Support</h4>
                            <p>Unsere Experten antworten Ihnen werktags in Rekordzeit.</p>
                        </div>
                        <div class="trust-item">
                            <div style="font-size: 36px">📦</div>
                            <h4>Versand</h4>
                            <p>Sicher verpackt für einen unbeschadeten Transport.</p>
                        </div>
                    </div>

                    <div class="service-note">
                        <h4>WICHTIGER HINWEIS</h4>
                        <p>Herzlichen Dank für Ihr Vertrauen. Wir versenden sofort nach Zahlungseingang. Bei Fragen steht unser Team am Standort Deutschland jederzeit für Sie bereit.</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="footer">
            <p>© 2026 <strong>${storeName} Official Store</strong>. Alle Rechte vorbehalten.</p>
            <p>Ein Kopieren von Bild- oder Textmaterial wird rechtlich verfolgt. ✅</p>
            <div class="seo-tags">
                <strong>SEO Optimierung:</strong> ${processText(data.keywords)}
            </div>
        </div>
    </div>
</body>
</html>`;
  };

  const downloadHTML = () => {
    const html = generateHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ebay-listing-${data.title.replace(/\s+/g, '-').toLowerCase() || 'template'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans">
      {/* Sidebar/Navigation */}
      <nav className="fixed top-0 bottom-0 left-0 w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl z-20 flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
             <span className="block font-bold text-lg tracking-tight leading-none">{data.storeName || 'AI Lister'}</span>
             <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Ultimate SEO v4.0</span>
          </div>
        </div>

        <div className="space-y-1">
          <button 
            onClick={() => setShowPreview(false)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${!showPreview ? 'bg-indigo-600/10 text-indigo-400 font-medium' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Edit3 className="w-4 h-4" />
            Hashir E-commerce Solution
          </button>
          <button 
            onClick={() => setShowPreview(true)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${showPreview ? 'bg-indigo-600/10 text-indigo-400 font-medium' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Eye className="w-4 h-4" />
            Live Preview
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2">
          <button
            onClick={() => handleImageAction('copy')}
            disabled={!data.title || !data.description}
            className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-orange-600/10 text-orange-400 hover:bg-orange-600/20 transition-all border border-orange-600/20 disabled:opacity-30 text-[10px] font-bold"
          >
            <Copy className="w-3 h-3" />
            COPY DETAIL IMAGE
          </button>
          <button
            onClick={() => handleImageAction('download')}
            disabled={!data.title || !data.description}
            className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-slate-700/50 text-slate-300 hover:bg-slate-700 transition-all border border-slate-700 disabled:opacity-30 text-[10px] font-bold uppercase"
          >
            <Download className="w-3 h-3" />
            DOWNLOAD IMAGE
          </button>
        </div>

        <div className="mt-8 space-y-4">
          <div className="px-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Store Identity</label>
            <input 
              type="text"
              value={data.storeName}
              onChange={(e) => setData(prev => ({ ...prev, storeName: e.target.value }))}
              placeholder="Store Name..."
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none"
            />
          </div>
        </div>

        <div className="mt-auto px-4 py-3 rounded-xl bg-slate-800/20 border border-slate-700/50">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            System Active
          </div>
          <p className="text-[10px] text-slate-400">Hashir v4.0 Ultimate SEO Edition</p>
        </div>
      </nav>

      {/* Main Content */}
      <main className="ml-64 h-screen overflow-hidden">
        <div className="h-full flex flex-col overflow-y-auto">
          {/* Header Bar */}
          <header className={`p-6 border-b border-slate-800 bg-[#020617]/50 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between`}>
            <div className="flex items-center gap-4">
              <div className="p-2 bg-indigo-600/10 rounded-lg">
                <Store className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-sm font-black text-white tracking-widest uppercase">Hashir E-Commerce Solutions</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Enterprise v4.0 Ultimate SEO Edition</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Active</span>
               </div>
            </div>
          </header>

          {showPreview ? (
            <div className="flex-1 bg-[#0f172a] p-10">
              <div className="max-w-4xl mx-auto">
                  <div className="flex items-center justify-between mb-8">
                     <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Live Preview</h2>
                        <p className="text-slate-400">Centered & fixed-width rendering at 900px.</p>
                     </div>
                     <div className="flex gap-4">
                        <button 
                          onClick={copyToClipboard}
                          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg active:scale-95"
                        >
                          <Copy className="w-4 h-4" />
                          Copy HTML
                        </button>
                        <button 
                          onClick={downloadPortableTool}
                          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg active:scale-95"
                        >
                          <Download className="w-4 h-4" />
                          Export Tool
                        </button>
                     </div>
                  </div>
                  
                  <div className="flex justify-center items-start min-h-full pb-20">
                     <div className="w-full max-w-[900px] bg-white rounded-lg shadow-2xl overflow-hidden text-slate-900 border border-slate-800/10 h-[800px]">
                        <iframe 
                          srcDoc={generateHTML()}
                          className="w-full h-full border-none"
                          title="eBay Listing Preview"
                        />
                     </div>
                  </div>
              </div>
            </div>
          ) : (
            <div className="p-8 lg:p-12">
               <motion.div
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="max-w-4xl mx-auto space-y-8 pb-12"
               >
                 <div className="flex items-end justify-between">
                   <div>
                      <h1 className="text-3xl font-bold text-white mb-2">Hashir E-commerce Solution</h1>
                      <p className="text-slate-400 font-medium text-sm">Professional AI-driven eBay SEO Research & Listing Engine</p>
                    </div>
                    <div className="flex gap-2">
                     <button 
                       onClick={() => handleImageAction('copy')}
                       disabled={!data.title || !data.description}
                       className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-[11px] font-bold transition-all active:scale-95"
                     >
                       <Copy className="w-4 h-4" />
                       COPY IMAGE
                     </button>
                     <button 
                       onClick={() => handleImageAction('download')}
                       disabled={!data.title || !data.description}
                       className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 px-4 py-2 rounded-xl text-[11px] font-bold transition-all border border-slate-700 active:scale-95"
                     >
                       <Download className="w-4 h-4" />
                       SAVE IMAGE
                     </button>
                     <button 
                       onClick={copyToClipboard}
                       disabled={!data.title || !data.description}
                       className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold transition-all shadow-lg active:scale-95 ${copied ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'}`}
                     >
                       {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                       {copied ? 'COPIED!' : 'COPY HTML'}
                     </button>
                     <button 
                       onClick={downloadHTML}
                       disabled={!data.title || !data.description}
                       className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-[11px] font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                     >
                       <Download className="w-4 h-4" />
                       EXPORT HTML
                     </button>
                   </div>
                 </div>

                     {/* Title Section */}
                  <div className="group relative bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all font-sans">
                    <div className="flex items-center justify-between mb-4">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                        <Package className="w-4 h-4 text-indigo-400" />
                        AI-Optimized eBay Title (Unlimited)
                      </label>
                      <button 
                        onClick={optimizeTitle}
                        disabled={isOptimizingTitle || !data.title}
                        className="flex items-center gap-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors uppercase font-bold"
                      >
                        {isOptimizingTitle ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                        Research SEO (80 Words)
                      </button>
                    </div>
                    <input 
                      type="text"
                      value={data.title}
                      onChange={(e) => setData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Title will be AI-crafted..."
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-indigo-400 focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold text-lg outline-none"
                    />
                    <div className="mt-2 text-[10px] text-slate-500 flex justify-between uppercase font-bold tracking-tight">
                      <span>⚡ AI Research Active: Priority Keywords Loaded</span>
                      <span className="text-indigo-500">{data.title.split(/\s+/).filter(Boolean).length} Words</span>
                    </div>
                  </div>

                  {/* Description Section */}
                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                        <Edit3 className="w-4 h-4 text-indigo-400" />
                        German Key Features
                      </label>
                      <div className="flex gap-4">
                        <button 
                          onClick={improveDescription}
                          disabled={isImproving || !data.description}
                          className="flex items-center gap-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          {isImproving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                          Refine Text
                        </button>
                        <button 
                          onClick={autoGenerateExtras}
                          disabled={isGeneratingExtras || (!data.description && !data.title)}
                          className="flex items-center gap-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold transition-all border border-emerald-600/20"
                        >
                          {isGeneratingExtras ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                          AI Extras
                        </button>
                      </div>
                    </div>
                    <textarea 
                      rows={8}
                      value={data.description}
                      onChange={(e) => setData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe benefits (one per line)..."
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none outline-none"
                    />
                  </div>

                 {/* Key Highlights Editor */}
                 <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        Key Highlights
                      </h3>
                      <button onClick={addHighlight} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 uppercase font-bold tracking-tighter">
                        <Plus className="w-3 h-3" /> Add Highlight
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {data.highlights.map((h, i) => (
                        <div key={i} className="flex gap-2 bg-slate-950/50 p-2 rounded-xl border border-slate-800 focus-within:border-indigo-500/50 transition-all">
                          <input 
                            type="text"
                            value={h.icon}
                            onChange={(e) => updateHighlight(i, h.text, e.target.value)}
                            className="w-10 bg-slate-900 border border-slate-800 rounded text-center text-sm text-white"
                          />
                          <input 
                            type="text"
                            value={h.text}
                            onChange={(e) => updateHighlight(i, e.target.value)}
                            className="flex-1 bg-transparent border-none p-0 text-sm focus:ring-0 text-slate-300"
                            placeholder="Highlight..."
                          />
                          <button onClick={() => removeHighlight(i)} className="text-slate-600 hover:text-red-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Images Section */}
                  <div className="space-y-4 pt-4 border-t border-slate-800/50">
                    <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-indigo-400" />
                      Image Assets (URLs)
                    </h3>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="Paste image URL..."
                        className="flex-1 bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <button onClick={addImage} className="bg-slate-800 hover:bg-slate-700 text-indigo-400 px-4 py-2 rounded-xl text-sm font-bold border border-slate-700">Add</button>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      {data.images.map((img, i) => (
                        <div key={i} className="group relative bg-slate-950/50 border border-slate-800 rounded-xl overflow-hidden aspect-square">
                          <img src={img.url} alt="" className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
                          <button onClick={() => removeImage(i)} className="absolute top-1 right-1 p-1 bg-red-500/80 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
        </div>
      </main>

      <canvas ref={canvasRef} width="1200" height="1200" className="hidden" />
    </div>
  );
}

