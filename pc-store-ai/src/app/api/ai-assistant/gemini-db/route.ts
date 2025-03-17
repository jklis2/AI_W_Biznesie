import { NextResponse } from 'next/server';
import dotenv from 'dotenv';
import { Product } from '../../../../models/product';
import mongoose from 'mongoose';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
mongoose.set('bufferCommands', false);

// Definicja słów kluczowych dla różnych kategorii i kontekstów
const intentKeywords = {
  pcSet: ['set', 'computer', 'pc', 'complete', 'zestaw', 'komputer'],
  monitors: ['monitor', 'display', 'screen', 'wyświetlacz', 'ekran'],
  peripherals: {
    general: ['peripheral', 'peryferium', 'peryferia'],
    keyboard: ['keyboard', 'klawiatura'],
    mouse: ['mouse', 'mysz'],
    headphones: ['headphones', 'headset', 'słuchawki'],
    microphone: ['microphone', 'mic', 'mikrofon'],
    webcam: ['webcam', 'camera', 'kamera'],
    speakers: ['speakers', 'speaker', 'głośniki'],
  },
  contexts: {
    gaming: ['gaming', 'game', 'cs', 'csgo', 'counter-strike', 'fps', 'gra', 'granie'],
    streaming: ['streaming', 'stream', 'broadcast', 'twitch', 'youtube', 'transmisja', 'streamowanie'],
    office: ['office', 'work', 'business', 'productivity', 'biuro', 'praca'],
  },
  components: {
    cpu: ['processor', 'cpu', 'procesor'],
    gpu: ['graphics card', 'gpu', 'karta graficzna'],
    ram: ['ram', 'memory', 'pamięć'],
    motherboard: ['motherboard', 'płyta główna'],
    storage: ['storage', 'disk', 'dysk'],
    psu: ['power supply', 'psu', 'zasilacz'],
    case: ['case', 'obudowa'],
    cooling: ['cooling', 'chłodzenie'],
  },
};

// Mapowanie ID kategorii i podkategorii
const categoryIds = {
  computerComponents: '67d17630f8f03be2997a1d68',
  peripherals: '67d17809f8f03be2997a1d87',
  monitors: '67d4627156b12a5ab4c06ea9',
  subcategories: {
    cpu: '67d1765af8f03be2997a1d6b',
    gpu: '67d41a66a4e0ee036020e263',
    ram: '67d17720f8f03be2997a1d7e',
    motherboard: '67d45eb356b12a5ab4c06e89',
    storage: '67d45f7056b12a5ab4c06e94',
    psu: '67d1777df8f03be2997a1d84',
    case: '67d4607a56b12a5ab4c06e9e',
    cooling: '67d698da2175a06e877d64f6',
    keyboard: '67d1782ff8f03be2997a1d89',
    mouse: '67d35efb14cdce3339818d61',
    microphone: '67d4612c56b12a5ab4c06ea2',
    webcam: '67d4613356b12a5ab4c06ea3',
    speakers: '67d4615056b12a5ab4c06ea4',
    headphones: '67d4615956b12a5ab4c06ea5',
    monitor32: '67d462b756b12a5ab4c06eab',
    monitor27: '67d462db56b12a5ab4c06eac',
    monitor24: '67d462f656b12a5ab4c06ead',
    monitor21: '67d4630856b12a5ab4c06eae',
  },
};

// Funkcja wykrywająca intencję użytkownika
function detectIntent(message) {
  const lowerMessage = message.toLowerCase();

  // Detect main category
  if (intentKeywords.pcSet.some(keyword => lowerMessage.includes(keyword))) {
    return { type: 'pcSet' };
  }

  if (intentKeywords.monitors.some(keyword => lowerMessage.includes(keyword))) {
    return { type: 'monitors' };
  }

  // Detect peripherals
  for (const [peripheralType, keywords] of Object.entries(intentKeywords.peripherals)) {
    if (peripheralType !== 'general' && keywords.some(keyword => lowerMessage.includes(keyword))) {
      // Detect context
      for (const [context, contextKeywords] of Object.entries(intentKeywords.contexts)) {
        if (contextKeywords.some(keyword => lowerMessage.includes(keyword))) {
          return { type: 'peripherals', subtype: peripheralType, context };
        }
      }
      return { type: 'peripherals', subtype: peripheralType };
    }
  }

  // Check general peripherals
  if (intentKeywords.peripherals.general.some(keyword => lowerMessage.includes(keyword))) {
    // Detect context
    for (const [context, contextKeywords] of Object.entries(intentKeywords.contexts)) {
      if (contextKeywords.some(keyword => lowerMessage.includes(keyword))) {
        return { type: 'peripherals', context };
      }
    }
    return { type: 'peripherals' };
  }

  // Detect components
  for (const [componentType, keywords] of Object.entries(intentKeywords.components)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      return { type: 'component', subtype: componentType };
    }
  }

  // Default to single component
  return { type: 'component' };
}

// Database connection function
const connectToDatabase = async () => {
  if (mongoose.connection.readyState === 0) {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined');
    }
    await mongoose.connect(mongoUri);
  }
};

// Parse user message to extract preferences
const parseUserMessage = async message => {
  const systemParseMessage = `
You are a text parser. Your task is to analyze the user's text and extract possible parameters:

Computer components:
- processor (CPU)
- graphics card (GPU)
- RAM memory
- motherboard
- storage
- power supply (PSU)
- case
- cooling

Peripherals:
- keyboard
- mouse
- microphone
- webcam
- speakers
- headphones

Monitors:
- monitor size (specify if it's 32" and Larger, 27" (26.5"-28.4"), 24" (23.5"-26.4"), or 21" and Smaller)

Budget:
- budget

Price Constraints:
- priceConstraint (e.g., "najdroższa" for most expensive)

If something is not mentioned, set the value to null.
Return only a JSON object with keys: "CPU", "GPU", "RAM", "motherboard", "storage", "PSU", "case", "cooling", "keyboard", "mouse", "microphone", "webcam", "speakers", "headphones", "monitor", "budget", "priceConstraint".
Do not add any other text, comments, or explanations.
`;
  const userParsePrompt = `User text: "${message}"`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: systemParseMessage }, { text: userParsePrompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 150 },
      }),
    });

    if (!response.ok) {
      console.error('Gemini API error:', response.status, response.statusText);
      return {};
    }

    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

    // Remove backticks and "json" keyword if present
    text = text.replace(/```json\n/g, '').replace(/```/g, '');

    try {
      return JSON.parse(text);
    } catch (jsonError) {
      console.error('Error parsing JSON:', jsonError);
      console.error('Received text:', text);
      return {};
    }
  } catch (e) {
    console.error('Error parsing user message:', e);
    return {};
  }
};

// Universal query builder function
const buildQuery = (subcategoryId, preferences = {}, budget = null) => {
  const query = { subcategory: subcategoryId };

  // Add filters based on preferences
  if (preferences && Object.keys(preferences).length > 0) {
    const filters = [];
    for (const [key, value] of Object.entries(preferences)) {
      if (value) {
        filters.push({ name: { $regex: value, $options: 'i' } });
        filters.push({ description: { $regex: value, $options: 'i' } });
      }
    }

    if (filters.length > 0) {
      query.$or = filters;
    }
  }

  // Add budget constraint
  if (budget) {
    const budgetValue = parseFloat(budget);
    if (!isNaN(budgetValue)) {
      query.price = { $lte: budgetValue };
    }
  }

  return query;
};

// Build queries for computer components
const buildComponentQueries = (preferences, context = null) => {
  const queries = {};
  const components = {
    CPU: categoryIds.subcategories.cpu,
    GPU: categoryIds.subcategories.gpu,
    RAM: categoryIds.subcategories.ram,
    motherboard: categoryIds.subcategories.motherboard,
    storage: categoryIds.subcategories.storage,
    PSU: categoryIds.subcategories.psu,
    case: categoryIds.subcategories.case,
    cooling: categoryIds.subcategories.cooling,
  };

  // Build queries for each component
  for (const [key, subcategoryId] of Object.entries(components)) {
    queries[key] = buildQuery(subcategoryId, { [key]: preferences[key] }, preferences.budget ? preferences.budget / Object.keys(components).length : null);
  }

  // Adjust queries based on context
  if (context === 'gaming') {
    // Prioritize gaming components
    if (queries.GPU) {
      queries.GPU.$or = [...(queries.GPU.$or || []), { description: { $regex: 'gaming', $options: 'i' } }];
    }
    if (queries.CPU) {
      queries.CPU.$or = [...(queries.CPU.$or || []), { description: { $regex: 'high performance', $options: 'i' } }];
    }
  } else if (context === 'streaming') {
    // Prioritize streaming components
    if (queries.CPU) {
      queries.CPU.$or = [...(queries.CPU.$or || []), { description: { $regex: 'multi-core', $options: 'i' } }];
    }
    if (queries.GPU) {
      queries.GPU.$or = [...(queries.GPU.$or || []), { description: { $regex: 'video encoding', $options: 'i' } }];
    }
  }

  return queries;
};

// Build queries for peripherals
const buildPeripheralQueries = (preferences, context = null) => {
  const queries = {};
  const peripherals = {
    keyboard: categoryIds.subcategories.keyboard,
    mouse: categoryIds.subcategories.mouse,
    microphone: categoryIds.subcategories.microphone,
    webcam: categoryIds.subcategories.webcam,
    speakers: categoryIds.subcategories.speakers,
    headphones: categoryIds.subcategories.headphones,
  };

  // Build queries for each peripheral
  for (const [key, subcategoryId] of Object.entries(peripherals)) {
    queries[key] = buildQuery(subcategoryId, { [key]: preferences[key] }, preferences.budget ? preferences.budget / Object.keys(peripherals).length : null);
  }

  // Adjust queries based on context
  if (context === 'gaming') {
    // Prioritize gaming peripherals
    if (queries.keyboard) {
      queries.keyboard.$or = [...(queries.keyboard.$or || []), { 'specifications.Purpose': { $regex: 'Gaming', $options: 'i' } }];
    }
    if (queries.mouse) {
      queries.mouse.$or = [...(queries.mouse.$or || []), { 'specifications.Mouse Type': { $regex: 'Gaming', $options: 'i' } }];
    }
  } else if (context === 'streaming') {
    // Prioritize streaming peripherals
    if (queries.microphone) {
      queries.microphone.$or = [...(queries.microphone.$or || []), { description: { $regex: 'high quality', $options: 'i' } }];
    }
    if (queries.webcam) {
      queries.webcam.$or = [...(queries.webcam.$or || []), { description: { $regex: 'high resolution', $options: 'i' } }];
    }
  }

  return queries;
};

// Build queries for monitors
const buildMonitorQueries = preferences => {
  let monitorQuery = {};

  if (preferences.monitor) {
    if (preferences.monitor.includes('32') || preferences.monitor.includes('Larger')) {
      monitorQuery = buildQuery(categoryIds.subcategories.monitor32, { monitor: preferences.monitor }, preferences.budget);
    } else if (preferences.monitor.includes('27') || preferences.monitor.includes('26.5') || preferences.monitor.includes('28.4')) {
      monitorQuery = buildQuery(categoryIds.subcategories.monitor27, { monitor: preferences.monitor }, preferences.budget);
    } else if (preferences.monitor.includes('24') || preferences.monitor.includes('23.5') || preferences.monitor.includes('26.4')) {
      monitorQuery = buildQuery(categoryIds.subcategories.monitor24, { monitor: preferences.monitor }, preferences.budget);
    } else if (preferences.monitor.includes('21') || preferences.monitor.includes('Smaller')) {
      monitorQuery = buildQuery(categoryIds.subcategories.monitor21, { monitor: preferences.monitor }, preferences.budget);
    } else {
      // If no specific size is mentioned, search in all subcategories
      monitorQuery = {
        $or: [
          buildQuery(categoryIds.subcategories.monitor32, { monitor: preferences.monitor }, preferences.budget),
          buildQuery(categoryIds.subcategories.monitor27, { monitor: preferences.monitor }, preferences.budget),
          buildQuery(categoryIds.subcategories.monitor24, { monitor: preferences.monitor }, preferences.budget),
          buildQuery(categoryIds.subcategories.monitor21, { monitor: preferences.monitor }, preferences.budget),
        ],
      };
    }
  } else {
    // If no preferences are specified, search in all subcategories
    monitorQuery = {
      $or: [
        { subcategory: categoryIds.subcategories.monitor32 },
        { subcategory: categoryIds.subcategories.monitor27 },
        { subcategory: categoryIds.subcategories.monitor24 },
        { subcategory: categoryIds.subcategories.monitor21 },
      ],
    };

    // Add budget constraint
    if (preferences.budget) {
      const budgetValue = parseFloat(preferences.budget);
      if (!isNaN(budgetValue)) {
        monitorQuery.price = { $lte: budgetValue };
      }
    }
  }

  return { monitor: monitorQuery };
};

// Format product list for display
const formatProductList = (products, category) => {
  return products
    .map((product, index) => {
      let specs = '';

      // Format specifications based on category
      switch (category) {
        case 'CPU':
          specs = `- **Specifications**:
  - **Cores**: ${product.specifications?.Cores || 'N/A'}
  - **Threads**: ${product.specifications?.Threads || 'N/A'}
  - **Base Clock**: ${product.specifications?.['Base Clock'] || 'N/A'}
  - **Boost Clock**: ${product.specifications?.['Boost Clock'] || 'N/A'}
  - **TDP**: ${product.specifications?.TDP || 'N/A'}
  - **Socket**: ${product.specifications?.Socket || 'N/A'}`;
          break;
        case 'RAM':
          specs = `- **Specifications**:
  - **Memory Type**: ${product.specifications?.['Memory type'] || 'N/A'}
  - **Total Capacity**: ${product.specifications?.['Total capacity'] || 'N/A'}
  - **Clock Speed**: ${product.specifications?.['Clock speed'] || 'N/A'}
  - **Cycle Latency**: ${product.specifications?.['Cycle latency'] || 'N/A'}`;
          break;
        case 'monitor':
          specs = `- **Specifications**:
  - **Resolution**: ${product.specifications?.resolution || 'N/A'}
  - **Refresh Rate**: ${product.specifications?.['Refresh Rate'] || product.specifications?.refreshRate || 'N/A'} Hz
  - **Panel Type**: ${product.specifications?.['Panel Type'] || product.specifications?.panelType || 'N/A'}`;
          break;
        case 'keyboard':
          specs = `- **Specifications**:
  - **Type**: ${product.specifications?.Purpose || 'N/A'}
  - **Switches**: ${product.specifications?.Switches || 'N/A'}
  - **Backlighting**: ${product.specifications?.Backlighting || 'N/A'}`;
          break;
        case 'mouse':
          specs = `- **Specifications**:
  - **Type**: ${product.specifications?.['Mouse Type'] || 'N/A'}
  - **Sensor**: ${product.specifications?.Sensor || 'N/A'}
  - **Resolution**: ${product.specifications?.Resolution || 'N/A'}`;
          break;
        case 'microphone':
          specs = `- **Specifications**:
  - **Type**: ${product.specifications?.Type || 'N/A'}
  - **Connectivity**: ${product.specifications?.Connectivity || 'N/A'}
  - **Frequency Response**: ${product.specifications?.['Frequency Response'] || 'N/A'}`;
          break;
        case 'webcam':
          specs = `- **Specifications**:
  - **Resolution**: ${product.specifications?.Resolution || 'N/A'}
  - **Frame Rate**: ${product.specifications?.['Frame Rate'] || 'N/A'}
  - **Connectivity**: ${product.specifications?.Connectivity || 'N/A'}`;
          break;
        default:
          // Generic format for other categories
          specs = `- **Specifications**:`;
          if (product.specifications) {
            Object.entries(product.specifications).forEach(([key, value]) => {
              specs += `\n  - **${key}**: ${value || 'N/A'}`;
            });
          }
      }

      return `### Product ${index + 1}: **${product.name}**
- **Brand**: ${product.brand || 'N/A'}
- **Category**: ${product.subcategory?.name || category || 'N/A'}
- **Price**: ${product.price} PLN
${specs}`;
    })
    .join('\n\n');
};

// Generowanie odpowiedzi przy użyciu Gemini API
const generateGeminiResponse = async (systemMessage, userPrompt) => {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: systemMessage }, { text: userPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 700,
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.error('Gemini API error:', response.status, response.statusText);
      throw new Error('Failed to generate a response.');
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Failed to generate a response.';
  } catch (error) {
    console.error('Error in generateGeminiResponse:', error);
    throw error;
  }
};

export async function POST(req) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: `Method ${req.method} Not Allowed` }, { status: 405 });
  }

  try {
    await connectToDatabase();

    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    console.log('Received message:', message);

    // Detecting user intent
    const intent = detectIntent(message);
    console.log('Detected intent:', intent);

    const preferences = await parseUserMessage(message);
    console.log('Parsed preferences:', preferences);

    // Handle queries based on detected intent
    if (intent.type === 'pcSet') {
      console.log('Processing PC set query');
      return handlePcSetQuery(message, preferences);
    } else if (intent.type === 'monitors') {
      console.log('Processing monitor query');
      return handleMonitorQuery(message, preferences);
    } else if (intent.type === 'peripherals') {
      console.log('Processing peripheral query');
      return handlePeripheralQuery(message, preferences, intent);
    } else {
      console.log('Processing component query');
      return handleComponentQuery(message, preferences, intent);
    }
  } catch (err) {
    console.error('Error in API:', err);
    return NextResponse.json({ error: 'An error occurred while processing your request.' }, { status: 500 });
  }
}

// Function to handle PC set queries
async function handlePcSetQuery(message, preferences) {
  const componentQueries = buildComponentQueries(preferences);
  const components = await fetchComponents(componentQueries);

  if (!components) {
    return NextResponse.json({ reply: 'Unfortunately, no products were found that meet your criteria.' });
  }

  const formattedComponents = formatComponents(components);
  const systemMessage = `You are an expert in building PC computers. Based on the available components, propose the best configuration for a computer set. Pay attention to component compatibility (e.g., processor socket and motherboard, RAM standard). Explain the advantages of the proposed configuration and for what type of applications it will be suitable (gaming, office work, graphic processing, etc.). Format the answer in Markdown with clear headings and bold for important information.`;
  const userPrompt = `${message}\n\nHere are the available components:\n${formattedComponents}\n\nPlease recommend a computer set based on these components.`;

  return generateResponse(systemMessage, userPrompt);
}

// Function to handle monitor queries
async function handleMonitorQuery(message, preferences) {
  const monitorQueries = buildMonitorQueries(preferences);
  const products = await fetchProducts(monitorQueries.monitor, 10);

  if (products.length === 0) {
    return NextResponse.json({ reply: 'Unfortunately, no monitors were found that meet your criteria.' });
  }

  const formattedProducts = formatProductList(products, 'monitor');
  const systemMessage = `You are an expert in computer monitors. You advise clients on choosing the best monitor based on their needs. Pay attention to resolution, refresh rate, panel type, and other key parameters. Explain the advantages and disadvantages of individual models and for which applications they will be best (gaming, office work, graphics, etc.). Format the answer in Markdown with clear headings and bold for important information.`;
  const userPrompt = `${message}\n\nHere are the available monitors:\n${formattedProducts}\n\nPlease recommend a monitor based on these products.`;

  return generateResponse(systemMessage, userPrompt);
}

// Function to handle peripheral queries
async function handlePeripheralQuery(message, preferences, intent) {
  const peripheralQueries = buildPeripheralQueries(preferences, intent.context);
  const products = await fetchPeripheralProducts(peripheralQueries, intent);

  if (products.length === 0) {
    return NextResponse.json({ reply: 'Unfortunately, no peripherals were found that meet your criteria.' });
  }

  const formattedProducts = formatProductList(products, intent.subtype || 'peripheral');
  const systemMessage = generatePeripheralSystemMessage(intent.context);
  const userPrompt = `${message}\n\nHere are the available peripherals:\n${formattedProducts}\n\nPlease recommend based on these products.`;

  return generateResponse(systemMessage, userPrompt);
}

// Function to handle component queries
async function handleComponentQuery(message, preferences, intent) {
  const query = buildComponentQuery(intent, preferences);
  const products = await fetchProducts(query, 10);

  if (products.length === 0) {
    return NextResponse.json({ reply: 'Unfortunately, no products were found that meet your criteria.' });
  }

  const formattedProducts = formatProductList(products, intent.subtype || 'component');
  const systemMessage = `You are an expert in computer components. You advise clients on choosing the best parts based on their needs. Pay attention to key parameters and features. Explain the advantages and disadvantages of individual models and for which applications they will be best. Format the answer in Markdown with clear headings and bold for important information.`;
  const userPrompt = `${message}\n\nHere are the available products:\n${formattedProducts}\n\nPlease recommend based on these products.`;

  return generateResponse(systemMessage, userPrompt);
}

// Fetch components based on queries
async function fetchComponents(componentQueries) {
  const components = {};

  for (const [key, query] of Object.entries(componentQueries)) {
    components[key] = await fetchProducts(query, 3);
    console.log(`Found ${components[key].length} products for category ${key}`);
  }

  const hasComponents = Object.values(components).some(arr => arr.length > 0);
  return hasComponents ? components : null;
}

// Format components for display
function formatComponents(components) {
  let formattedComponents = '';
  for (const [category, products] of Object.entries(components)) {
    if (products.length > 0) {
      formattedComponents += `\n## ${category.toUpperCase()}\n\n`;
      formattedComponents += formatProductList(products, category);
    }
  }
  return formattedComponents;
}

// Fetch peripheral products based on queries and intent
async function fetchPeripheralProducts(peripheralQueries, intent) {
  let products = [];
  const peripheralType = intent.subtype || 'peripheral';
  const context = intent.context;

  if (peripheralType !== 'peripheral') {
    products = await fetchProducts(peripheralQueries[peripheralType], 10);
  } else {
    if (context === 'streaming') {
      const micProducts = await fetchProducts(peripheralQueries.microphone, 5);
      const webcamProducts = await fetchProducts(peripheralQueries.webcam, 5);
      products = [...micProducts, ...webcamProducts];
    } else {
      for (const [key, query] of Object.entries(peripheralQueries)) {
        const categoryProducts = await fetchProducts(query, 3);
        products = [...products, ...categoryProducts];
      }
      products = products.slice(0, 10);
    }
  }

  return products;
}

// Generate system message for peripheral queries
function generatePeripheralSystemMessage(context) {
  let systemMessage = `You are an expert in computer peripherals. You advise clients on choosing the best peripheral devices based on their needs. Pay attention to key parameters and features. Explain the advantages and disadvantages of individual models and for which applications they will be best.`;

  if (context === 'gaming') {
    systemMessage = `You are an expert in gaming peripherals. You advise gamers on choosing the best devices for gaming. Pay attention to key parameters and features important for gamers. Explain the advantages and disadvantages of individual models and for which games they will be best.`;
  } else if (context === 'streaming') {
    systemMessage = `You are an expert in streaming equipment. You advise streamers on choosing the best peripherals for live streaming. Pay attention to key parameters and features important for streaming quality. Explain the advantages and disadvantages of individual models and for which streaming applications they will be best.`;
  }

  systemMessage += ` Format the answer in Markdown with clear headings and bold for important information.`;
  return systemMessage;
}

// Build component query based on intent and preferences
function buildComponentQuery(intent, preferences) {
  let componentType = intent.subtype || '';
  let query = {};

  const componentMap = {
    cpu: { type: 'CPU', subcategory: categoryIds.subcategories.cpu },
    gpu: { type: 'GPU', subcategory: categoryIds.subcategories.gpu },
    ram: { type: 'RAM', subcategory: categoryIds.subcategories.ram },
    motherboard: { type: 'motherboard', subcategory: categoryIds.subcategories.motherboard },
    storage: { type: 'storage', subcategory: categoryIds.subcategories.storage },
    psu: { type: 'PSU', subcategory: categoryIds.subcategories.psu },
    case: { type: 'case', subcategory: categoryIds.subcategories.case },
    cooling: { type: 'cooling', subcategory: categoryIds.subcategories.cooling },
  };

  if (componentType && componentMap[componentType]) {
    const component = componentMap[componentType];
    componentType = component.type;
    query = { subcategory: component.subcategory };

    const prefKey = componentType.toUpperCase();
    if (preferences[prefKey]) {
      query.$or = [{ name: { $regex: preferences[prefKey], $options: 'i' } }, { description: { $regex: preferences[prefKey], $options: 'i' } }];
    }
  } else {
    componentType = 'component';
    query = { category: categoryIds.computerComponents };
  }

  if (preferences.budget) {
    const budgetValue = parseFloat(preferences.budget);
    if (!isNaN(budgetValue)) {
      query.price = { $lte: budgetValue };
    }
  }

  // Handle specific price constraints like "najdroższa" (most expensive)
  if (preferences.priceConstraint === 'najdroższa') {
    query.price = { $gte: 0 }; // Ensure we have a price filter
    query.sort = { price: -1 }; // Sort by price descending
  }

  return query;
}

async function fetchProducts(query, limit = 10) {
  try {
    return await Product.find(query).limit(limit).exec();
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

async function generateResponse(systemMessage, userPrompt) {
  try {
    const generatedText = await generateGeminiResponse(systemMessage, userPrompt);
    const detailedResponse = `## Recommendations\n\n${generatedText}\n\n### Key Features\n\n${highlightKeyFeatures(generatedText)}`;
    return NextResponse.json({ reply: detailedResponse });
  } catch (error) {
    console.error('Error generating response:', error);
    return NextResponse.json({ error: 'Failed to generate a response.' }, { status: 500 });
  }
}

function highlightKeyFeatures(responseText) {
  // Extract and highlight key features from the response text
  const keyFeatures = responseText.match(/- \*\*[^:]+:\*\* [^\n]+/g) || [];
  return keyFeatures.join('\n');
}
