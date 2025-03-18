import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ChatAssistantRef } from '@/containers/ChatAssistant';
import { RefObject } from 'react';

interface Message {
  content: string;
  role: 'user' | 'assistant';
  id: string;
}

interface ChatData {
  assistantName: string;
  messages: Message[];
}

// Definicje kategorii i podkategorii komponentów komputerowych
interface ComponentCategory {
  name: string;
  subcategories: string[];
}

// Interfejs dla znalezionego komponentu
interface FoundComponent {
  name: string;
  price?: string | null;
}

// Kolory dla stylów
const COLORS = {
  PRIMARY: '4F6AFF', // Niebieski
  SECONDARY: '6C757D', // Szary
  SUCCESS: '28A745', // Zielony
  DANGER: 'DC3545', // Czerwony
  WARNING: 'FFC107', // Żółty
  INFO: '17A2B8', // Turkusowy
  LIGHT: 'F8F9FA', // Jasny szary
  DARK: '343A40', // Ciemny szary
  WHITE: 'FFFFFF', // Biały
  BLACK: '000000', // Czarny
  HEADER_BG: '212529', // Tło nagłówka
  CATEGORY_BG: 'E9ECEF', // Tło kategorii
  SUBCATEGORY_BG: 'F8F9FA', // Tło podkategorii
  BORDER: 'DEE2E6', // Kolor obramowania
};

const computerComponents: ComponentCategory[] = [
  {
    name: 'Computer components',
    subcategories: ['Processor', 'RAM', 'PC Power Supplies', 'Graphics cards', 'Motherboards', 'Storage', 'Case', 'Cooling']
  }
];

/**
 * Analizuje wiadomości czatu przy użyciu Gemini API
 * @param messages Lista wiadomości z czatu
 * @returns Obiekt zawierający znalezione komponenty pogrupowane według kategorii i podkategorii
 */
const analyzeComponentsWithGemini = async (messages: Message[]): Promise<Record<string, FoundComponent[]>> => {
  const foundComponents: Record<string, FoundComponent[]> = {};
  
  // Inicjalizacja pustych tablic dla każdej podkategorii
  computerComponents.forEach(category => {
    category.subcategories.forEach(subcategory => {
      foundComponents[subcategory] = [];
    });
  });

  // Mapowanie alternatywnych nazw kategorii na nasze standardowe nazwy
  const categoryMapping: Record<string, string> = {
    'CPU': 'Processor',
    'Processor': 'Processor',
    'Motherboard': 'Motherboards',
    'Motherboards': 'Motherboards',
    'RAM': 'RAM',
    'Memory': 'RAM',
    'Graphics Card': 'Graphics cards',
    'Graphics Cards': 'Graphics cards',
    'GPU': 'Graphics cards',
    'Graphics cards': 'Graphics cards',
    'Storage': 'Storage',
    'SSD': 'Storage',
    'HDD': 'Storage',
    'Power Supply': 'PC Power Supplies',
    'PSU': 'PC Power Supplies',
    'PC Power Supplies': 'PC Power Supplies',
    'Case': 'Case',
    'Computer Case': 'Case',
    'Chassis': 'Case',
    'Cooling': 'Cooling',
    'CPU Cooler': 'Cooling',
    'Cooler': 'Cooling'
  };

  try {
    // Użyj klucza API bezpośrednio z kodu - hardcoded dla uproszczenia
    const GEMINI_API_KEY = 'AIzaSyBG5ik8opRgzbehGsNSBBFyD9rMBwxZVN0';
    
    console.log('Using Gemini API key:', GEMINI_API_KEY ? 'Key is available' : 'Key is NOT available');

    // Przygotuj treść wiadomości do analizy
    const chatContent = messages.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n\n');
    console.log('Prepared chat content for analysis, length:', chatContent.length);

    const systemPrompt = `
You are a specialized AI for analyzing computer component discussions. Extract all mentioned computer components from the chat conversation.
For each component, identify:
1. The exact component name/model
2. The price if mentioned (if no price is mentioned, set price to "N/A")

Categorize components into these categories:
${computerComponents.map(category => 
  `${category.name}: ${category.subcategories.join(', ')}`
).join('\n')}

IMPORTANT: Be thorough in your analysis. Look for specific component models and their prices throughout the entire conversation. Extract ALL mentioned components, even if they appear in long paragraphs or detailed explanations.

For example, if the text mentions "CPU: AMD Ryzen 7 7700X (~$350)" or "AMD Ryzen 5 5600 (469 PLN)", extract it as a Processor with the appropriate price.

Return ONLY a JSON object with this exact structure:
{
  "Processor": [{"name": "AMD Ryzen 7 7700X", "price": "1425 PLN"}, ...],
  "RAM": [{"name": "Kingston FURY 32GB (2x16GB) 3600MHz CL18", "price": "300 PLN"}, ...],
  "PC Power Supplies": [{"name": "Corsair RM850x", "price": "130 USD"}, ...],
  "Graphics cards": [{"name": "NVIDIA GeForce RTX 4070 Ti", "price": "800 USD"}, ...],
  "Motherboards": [{"name": "MSI B550-A PRO", "price": "469 PLN"}, ...],
  "Storage": [{"name": "Kingston 1TB M.2 PCIe Gen4 NVMe NV3", "price": "225 PLN"}, ...],
  "Case": [{"name": "Fractal Design North Charcoal Black", "price": "599 PLN"}, ...],
  "Cooling": [{"name": "be quiet! Pure Rock 2 Black 120mm", "price": "195 PLN"}, ...]
}

Include all subcategories exactly as listed above, even if empty (use empty arrays).
Be extremely precise with component names and prices. If no price is mentioned for a component, use "N/A" as the price.
`;

    const userPrompt = `Chat conversation to analyze:\n\n${chatContent}`;

    console.log('Sending request to Gemini API...');
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }, { text: userPrompt }] }],
        generationConfig: {
          maxOutputTokens: 2000,
          temperature: 0.1
        }
      }),
    });

    console.log('Gemini API response status:', response.status);
    const data = await response.json();
    console.log('Received response from Gemini API:', data ? 'Data received' : 'No data');
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Invalid response structure from Gemini:', JSON.stringify(data));
      return foundComponents;
    }
    
    const responseText = data.candidates[0].content.parts[0].text;
    console.log('Parsing response from Gemini, text length:', responseText.length);
    
    try {
      // Extract JSON from response (in case there's any extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log('Found JSON in response, length:', jsonMatch[0].length);
        const parsedData = JSON.parse(jsonMatch[0]);
        console.log('Successfully parsed JSON from Gemini response');
        
        // Merge the results into foundComponents with category mapping
        Object.entries(parsedData).forEach(([category, components]) => {
          if (Array.isArray(components)) {
            const standardCategory = categoryMapping[category] || category;
            
            if (foundComponents[standardCategory]) {
              // Add each component to the appropriate category
              (components as FoundComponent[]).forEach((component: FoundComponent) => {
                // Ensure component has a name and price (use "N/A" if no price)
                if (component.name) {
                  foundComponents[standardCategory].push({
                    name: component.name,
                    price: component.price || "N/A"
                  });
                }
              });
            }
          }
        });
        
        console.log('Extracted components:', Object.keys(foundComponents).map(key => `${key}: ${foundComponents[key].length} items`));
      } else {
        console.error('Failed to extract JSON from Gemini response');
        console.log('Raw response (first 200 chars):', responseText.substring(0, 200));
      }
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      console.log('Raw response text (first 200 chars):', responseText.substring(0, 200));
    }
  } catch (error) {
    console.error('Error analyzing components with Gemini:', error);
  }
  
  return foundComponents;
};

/**
 * Generuje plik Excel zawierający podsumowanie rozmów ze wszystkich czatów
 * @param chatDataArray Tablica obiektów z danymi czatu zawierającymi nazwę asystenta i wiadomości
 * @returns Czy generowanie pliku się powiodło
 */
const generateExcelSummary = async (chatDataArray: ChatData[]): Promise<boolean> => {
  try {
    // Utwórz nowy skoroszyt
    const workbook = XLSX.utils.book_new();
    
    // Analizuj komponenty dla każdego czatu
    const chatComponents: Record<string, Record<string, FoundComponent[]>> = {};
    
    for (let i = 0; i < chatDataArray.length; i++) {
      const chatData = chatDataArray[i];
      // Analizuj komponenty w czacie używając Gemini API
      chatComponents[chatData.assistantName] = await analyzeComponentsWithGemini(chatData.messages);
    }
    
    // Przygotuj dane dla arkusza SUMMARY
    const summaryData: Array<Array<string>> = [];
    
    // Dodaj nagłówki kolumn (używając nazw asystentów)
    const headers = ['Components'];
    chatDataArray.forEach((chatData) => {
      headers.push(chatData.assistantName);
      headers.push('Price');
    });
    summaryData.push(headers);
    
    // Dodaj wszystkie kategorie i podkategorie w pierwszej kolumnie
    computerComponents.forEach(category => {
      // Dodaj wiersz kategorii
      const categoryRow = new Array(headers.length).fill('');
      categoryRow[0] = category.name;
      summaryData.push(categoryRow);
      
      // Dodaj wiersze podkategorii
      category.subcategories.forEach(subcategory => {
        const subcategoryRow = new Array(headers.length).fill('');
        subcategoryRow[0] = subcategory;
        
        // Dodaj znalezione komponenty dla każdego czatu w odpowiednich kolumnach
        chatDataArray.forEach((chatData, chatIndex) => {
          const components = chatComponents[chatData.assistantName][subcategory] || [];
          if (components.length > 0) {
            // Wybierz najlepszy komponent (pierwszy z listy)
            const bestComponent = components[0];
            // Kolumna z nazwą komponentu
            subcategoryRow[chatIndex * 2 + 1] = bestComponent.name;
            // Kolumna z ceną
            subcategoryRow[chatIndex * 2 + 2] = bestComponent.price || '';
          }
        });
        
        summaryData.push(subcategoryRow);
      });
    });
    
    // Utwórz arkusz SUMMARY
    const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Dostosuj szerokość kolumn
    const summaryCols = [
      { wch: 25 }, // Components
    ];
    
    // Dodaj szerokość dla każdego czatu (nazwa i cena)
    chatDataArray.forEach(() => {
      summaryCols.push({ wch: 40 }); // Szerokość kolumny dla nazwy komponentu
      summaryCols.push({ wch: 15 }); // Szerokość kolumny dla ceny
    });
    
    summaryWorksheet['!cols'] = summaryCols;
    
    // Dodaj style do arkusza SUMMARY
    for (let i = 0; i < summaryData.length; i++) {
      // Nagłówek
      if (i === 0) {
        for (let j = 0; j < headers.length; j++) {
          const cellRef = XLSX.utils.encode_cell({ r: i, c: j });
          if (!summaryWorksheet[cellRef]) summaryWorksheet[cellRef] = {};
          summaryWorksheet[cellRef].s = {
            fill: { fgColor: { rgb: COLORS.HEADER_BG } },
            font: { color: { rgb: COLORS.WHITE }, bold: true },
            alignment: { horizontal: 'center', vertical: 'center' }
          };
        }
      }
      // Kategorie
      else if (summaryData[i][0] && computerComponents.some(cat => cat.name === summaryData[i][0])) {
        // Komórka kategorii
        const cellRef = XLSX.utils.encode_cell({ r: i, c: 0 });
        if (!summaryWorksheet[cellRef]) summaryWorksheet[cellRef] = {};
        summaryWorksheet[cellRef].s = {
          fill: { fgColor: { rgb: COLORS.CATEGORY_BG } },
          font: { bold: true },
          alignment: { vertical: 'center' }
        };
        
        // Pozostałe komórki w wierszu kategorii
        for (let j = 1; j < headers.length; j++) {
          const cellRef = XLSX.utils.encode_cell({ r: i, c: j });
          if (!summaryWorksheet[cellRef]) summaryWorksheet[cellRef] = {};
          summaryWorksheet[cellRef].s = {
            fill: { fgColor: { rgb: COLORS.CATEGORY_BG } }
          };
        }
      }
      // Podkategorie
      else {
        // Komórka podkategorii
        const cellRef = XLSX.utils.encode_cell({ r: i, c: 0 });
        if (!summaryWorksheet[cellRef]) summaryWorksheet[cellRef] = {};
        summaryWorksheet[cellRef].s = {
          fill: { fgColor: { rgb: COLORS.SUBCATEGORY_BG } },
          font: { bold: false },
          alignment: { vertical: 'center' }
        };
        
        // Komórki z danymi komponentów
        for (let j = 1; j < headers.length; j++) {
          const cellRef = XLSX.utils.encode_cell({ r: i, c: j });
          if (!summaryWorksheet[cellRef]) summaryWorksheet[cellRef] = {};
          summaryWorksheet[cellRef].s = {
            fill: { fgColor: { rgb: COLORS.SUBCATEGORY_BG } },
            alignment: j % 2 === 0 ? { horizontal: 'right' } : { horizontal: 'left' }
          };
        }
      }
    }
    
    // Dodaj arkusz SUMMARY do skoroszytu
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'SUMMARY');
    
    // Utwórz plik Excel
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Pobierz plik
    saveAs(blob, `PC_Store_AI_Summary_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    return true;
  } catch (error) {
    console.error('Error generating Excel summary:', error);
    return false;
  }
};

/**
 * Zbiera dane z czatu ze wszystkich aktywnych asystentów czatu na stronie
 * @param chatRefs Tablica referencji do komponentów asystenta czatu
 * @returns Tablica danych czatu
 */
const collectChatData = (chatRefs: RefObject<ChatAssistantRef | null>[]): ChatData[] => {
  const chatDataArray: ChatData[] = [];
  
  chatRefs.forEach(ref => {
    if (ref.current) {
      const messages = ref.current.getMessages();
      const assistantName = ref.current.getName();
      
      // Dodaj dane czatu tylko jeśli zawiera więcej niż jedną wiadomość (początkowe powitanie)
      if (messages.length > 1) {
        chatDataArray.push({
          assistantName,
          messages
        });
      }
    }
  });
  
  return chatDataArray;
};

/**
 * Główna funkcja do generowania podsumowania Excel ze wszystkich czatów
 * @param chatRefs Tablica referencji do komponentów asystenta czatu
 */
const generateAllChatsSummary = async (chatRefs: RefObject<ChatAssistantRef | null>[]): Promise<boolean> => {
  try {
    // Zbierz dane z czatu
    const chatDataArray = collectChatData(chatRefs);
    
    if (chatDataArray.length === 0) {
      alert('No chat data found. Please have at least one conversation before generating a summary.');
      return false;
    }
    
    // Generuj podsumowanie Excel
    return await generateExcelSummary(chatDataArray);
  } catch (error) {
    console.error('Error generating all chats summary:', error);
    alert('An error occurred while generating the summary. Please try again.');
    return false;
  }
};

export { generateExcelSummary, collectChatData, generateAllChatsSummary };
