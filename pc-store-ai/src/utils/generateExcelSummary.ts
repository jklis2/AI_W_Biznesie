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
    name: 'Components',
    subcategories: ['CPU', 'Motherboard', 'RAM', 'Graphics cards', 'Storage', 'PC Power Supplies', 'Case', 'Cooling']
  },
  {
    name: 'Peripherals',
    subcategories: ['Keyboards', 'Mouse', 'Microphone', 'Webcam', 'Speakers', 'Headphones']
  },
  {
    name: 'Monitors',
    subcategories: ['32" and Larger', '27" (26.5"-28.4")', '24" (23.5"-26.4")', '21" and Smaller']
  }
];

// Słownik komponentów z popularnymi nazwami i modelami
const componentKeywords: Record<string, string[]> = {
  'CPU': ['CPU', 'processor', 'intel', 'amd', 'ryzen', 'core i', 'pentium', 'celeron', 'threadripper', 'i3', 'i5', 'i7', 'i9'],
  'RAM': ['ram', 'memory', 'ddr4', 'ddr5', 'dimm', 'sodimm', 'gb ram', 'memory stick'],
  'PC Power Supplies': ['psu', 'power supply', 'power supplies', 'watt', 'watts', 'w power', 'corsair', 'evga', 'seasonic'],
  'Graphics cards': ['gpu', 'graphics card', 'graphics', 'rtx', 'gtx', 'radeon', 'nvidia', 'amd', 'geforce'],
  'Motherboard': ['motherboard', 'mainboard', 'mobo', 'asus', 'gigabyte', 'msi', 'asrock', 'socket'],
  'Storage': ['ssd', 'hdd', 'nvme', 'storage', 'hard drive', 'solid state', 'samsung', 'western digital', 'seagate', 'kingston', 'tb', 'gb storage'],
  'Case': ['case', 'chassis', 'tower', 'atx', 'itx', 'mid tower', 'full tower'],
  'Cooling': ['cooling', 'cooler', 'fan', 'radiator', 'aio', 'liquid cooling', 'air cooling', 'heatsink', 'noctua'],
  'Keyboards': ['keyboard', 'mechanical keyboard', 'membrane keyboard', 'logitech', 'corsair', 'razer'],
  'Mouse': ['mouse', 'mice', 'logitech', 'razer', 'corsair', 'dpi'],
  'Microphone': ['microphone', 'mic', 'blue yeti', 'hyperx', 'audio technica'],
  'Webcam': ['webcam', 'camera', 'logitech c', 'streaming camera'],
  'Speakers': ['speakers', 'speaker', 'audio system', 'sound system', 'logitech speakers'],
  'Headphones': ['headphones', 'headset', 'earphones', 'hyperx', 'steelseries', 'sennheiser'],
  '32" and Larger': ['32 inch', '32"', '34"', '38"', '42"', '49"', 'ultrawide'],
  '27" (26.5"-28.4")': ['27 inch', '27"', '28"'],
  '24" (23.5"-26.4")': ['24 inch', '24"', '23"', '25"', '26"'],
  '21" and Smaller': ['21 inch', '21"', '20"', '19"', '17"']
};

// Popularne marki komponentów komputerowych
const popularBrands = [
  'Intel', 'AMD', 'Nvidia', 'ASUS', 'MSI', 'Gigabyte', 'ASRock', 'EVGA', 'Corsair', 'G.Skill', 
  'Crucial', 'Kingston', 'Samsung', 'Western Digital', 'Seagate', 'Cooler Master', 'NZXT', 
  'Thermaltake', 'be quiet!', 'Noctua', 'Fractal Design', 'Logitech', 'Razer', 'SteelSeries', 
  'HyperX', 'Sennheiser', 'Audio-Technica', 'Blue', 'Dell', 'LG', 'BenQ', 'Acer', 'ADATA',
  'Zotac', 'Sapphire', 'XFX', 'PowerColor', 'PNY', 'Palit', 'Gainward', 'Inno3D'
];

// Popularne serie produktów
const productSeries = [
  'Core i3', 'Core i5', 'Core i7', 'Core i9', 'Ryzen 3', 'Ryzen 5', 'Ryzen 7', 'Ryzen 9', 
  'Threadripper', 'GeForce RTX', 'GeForce GTX', 'Radeon RX', 'Radeon HD', 'ROG Strix', 
  'TUF Gaming', 'Aorus', 'Gaming X', 'Vengeance', 'Trident Z', 'HyperX Fury', 'Dominator',
  'EVO', 'PRO', 'Blue', 'Black', 'Red', 'Gold', 'Barracuda', 'FireCuda', 'IronWolf', 'WD Blue',
  'WD Black', 'WD Red', 'WD Gold', 'MX', 'BX', 'A', 'P', 'MP', 'SN', 'KC', 'Predator'
];

/**
 * Znajduje kwotę w tekście
 * @param text Tekst do przeszukania
 * @returns Znaleziona kwota lub null
 */
const findPrice = (text: string): string | null => {
  // Wzorce cen: $X, X$, X USD, X PLN, X zł, X EUR, X euro
  const priceRegex = /(\$\s*\d+(?:[.,]\d+)?|\d+(?:[.,]\d+)?\s*(?:\$|USD|PLN|zł|EUR|euro))/gi;
  const matches = text.match(priceRegex);
  
  if (matches && matches.length > 0) {
    return matches[0].trim();
  }
  
  return null;
};

/**
 * Analizuje wiadomości czatu w poszukiwaniu wzmianek o komponentach komputerowych
 * @param messages Lista wiadomości z czatu
 * @returns Obiekt zawierający znalezione komponenty pogrupowane według kategorii i podkategorii
 */
const analyzeComponentsInChat = (messages: Message[]): Record<string, FoundComponent[]> => {
  const foundComponents: Record<string, FoundComponent[]> = {};
  
  // Inicjalizacja pustych tablic dla każdej podkategorii
  computerComponents.forEach(category => {
    category.subcategories.forEach(subcategory => {
      foundComponents[subcategory] = [];
    });
  });
  
  // Analiza każdej wiadomości
  messages.forEach(message => {
    const content = message.content;
    const contentLower = content.toLowerCase();
    
    // Sprawdzenie każdej podkategorii
    Object.entries(componentKeywords).forEach(([subcategory, keywords]) => {
      // Sprawdzenie każdego słowa kluczowego
      keywords.forEach(keyword => {
        if (contentLower.includes(keyword.toLowerCase())) {
          // Znajdź indeks słowa kluczowego
          const keywordIndex = contentLower.indexOf(keyword.toLowerCase());
          
          // Wyodrębnij kontekst (50 znaków przed i po słowie kluczowym)
          const start = Math.max(0, keywordIndex - 50);
          const end = Math.min(content.length, keywordIndex + keyword.length + 50);
          const context = content.substring(start, end);
          
          // Znajdź cenę w kontekście
          const price = findPrice(context);
          
          // Próba wyodrębnienia nazwy modelu
          let componentName = '';
          
          // Sprawdź, czy w kontekście występuje jakaś znana marka
          const brandMatches = popularBrands.filter(brand => 
            context.toLowerCase().includes(brand.toLowerCase())
          );
          
          // Sprawdź, czy w kontekście występuje jakaś znana seria produktów
          const seriesMatches = productSeries.filter(series => 
            context.toLowerCase().includes(series.toLowerCase())
          );
          
          if (brandMatches.length > 0 || seriesMatches.length > 0) {
            // Jeśli znaleziono markę lub serię, spróbuj wyodrębnić pełną nazwę produktu
            // Wzorzec: [Marka] [Seria] [Model] [Specyfikacja]
            // Np. "Intel Core i7-12700K", "NVIDIA GeForce RTX 3080 Ti", "Corsair Vengeance RGB Pro 32GB DDR4"
            
            // Najpierw sprawdź, czy jest marka
            if (brandMatches.length > 0) {
              const brand = brandMatches[0];
              const brandIndex = context.toLowerCase().indexOf(brand.toLowerCase());
              
              // Weź do 30 znaków po marce, aby złapać pełną nazwę produktu
              const productContext = context.substring(
                brandIndex, 
                Math.min(context.length, brandIndex + brand.length + 30)
              );
              
              // Wyodrębnij nazwę produktu (do pierwszego znaku końca zdania lub przecinka)
              const productEndIndex = productContext.search(/[.,;!?]|$/) !== -1 
                ? productContext.search(/[.,;!?]|$/) 
                : productContext.length;
              
              componentName = productContext.substring(0, productEndIndex).trim();
            } 
            // Jeśli nie ma marki, ale jest seria
            else if (seriesMatches.length > 0) {
              const series = seriesMatches[0];
              const seriesIndex = context.toLowerCase().indexOf(series.toLowerCase());
              
              // Sprawdź, czy przed serią jest marka (do 15 znaków wstecz)
              const beforeSeries = context.substring(
                Math.max(0, seriesIndex - 15),
                seriesIndex
              );
              
              // Sprawdź, czy po serii jest model (do 15 znaków do przodu)
              const afterSeries = context.substring(
                seriesIndex + series.length,
                Math.min(context.length, seriesIndex + series.length + 15)
              );
              
              // Połącz wszystko w nazwę produktu
              componentName = (beforeSeries + series + afterSeries).trim();
              
              // Wyodrębnij nazwę produktu (do pierwszego znaku końca zdania lub przecinka)
              const productEndIndex = componentName.search(/[.,;!?]|$/) !== -1 
                ? componentName.search(/[.,;!?]|$/) 
                : componentName.length;
              
              componentName = componentName.substring(0, productEndIndex).trim();
            }
          }
          
          // Jeśli nie udało się wyodrębnić nazwy produktu za pomocą marek i serii,
          // użyj prostszej metody z wyrażeniem regularnym
          if (!componentName) {
            // Próba wyodrębnienia nazwy modelu (np. "RTX 3080", "Ryzen 7 5800X")
            const modelRegex = new RegExp(`(\\w+\\s*${keyword}\\s*\\w+|${keyword}\\s*\\w+|\\w+\\s*${keyword})`, 'i');
            const modelMatch = context.match(modelRegex);
            
            if (modelMatch && modelMatch[0]) {
              componentName = modelMatch[0].trim();
            }
          }
          
          // Dodaj tylko jeśli nie jest już na liście i ma sensowną długość
          if (componentName && componentName.length > 3) {
            // Sprawdź, czy ten komponent (lub bardzo podobny) już istnieje
            const exists = foundComponents[subcategory].some(comp => 
              comp.name.toLowerCase().includes(componentName.toLowerCase()) ||
              componentName.toLowerCase().includes(comp.name.toLowerCase())
            );
            
            if (!exists) {
              foundComponents[subcategory].push({
                name: componentName,
                price: price
              });
            } else if (price) {
              // Jeśli komponent już istnieje, ale znaleziono cenę, dodaj ją
              const existingComponent = foundComponents[subcategory].find(comp => 
                comp.name.toLowerCase().includes(componentName.toLowerCase()) ||
                componentName.toLowerCase().includes(comp.name.toLowerCase())
              );
              
              if (existingComponent && !existingComponent.price) {
                existingComponent.price = price;
              }
            }
          }
        }
      });
    });
  });
  
  return foundComponents;
};

/**
 * Generates an Excel file containing conversation summaries from all chats
 * @param chatDataArray Array of chat data objects containing assistant name and messages
 */
export const generateExcelSummary = (chatDataArray: ChatData[]): boolean => {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Utwórz arkusz z analizą komponentów w formacie zgodnym z obrazem
    // Przygotuj dane dla arkusza SUMMARY
    const summaryDataComponents: Array<Array<string>> = [];
    
    // Dodaj nagłówki kolumn (używając nazw asystentów zamiast Chat 1, Chat 2, itd.)
    const headers = ['Components'];
    chatDataArray.forEach((chatData) => {
      headers.push(chatData.assistantName);
    });
    summaryDataComponents.push(headers);
    
    // Analizuj komponenty dla każdego czatu
    const chatComponents: Record<string, Record<string, FoundComponent[]>> = {};
    chatDataArray.forEach(chatData => {
      chatComponents[chatData.assistantName] = analyzeComponentsInChat(chatData.messages);
    });
    
    // Dodaj wszystkie kategorie i podkategorie w pierwszej kolumnie
    computerComponents.forEach(category => {
      // Dodaj wiersz kategorii
      const categoryRow = new Array(headers.length).fill('');
      categoryRow[0] = category.name;
      summaryDataComponents.push(categoryRow);
      
      // Dodaj wiersze podkategorii
      category.subcategories.forEach(subcategory => {
        const subcategoryRow = new Array(headers.length).fill('');
        subcategoryRow[0] = subcategory;
        
        // Dodaj znalezione komponenty dla każdego czatu w odpowiednich kolumnach
        chatDataArray.forEach((chatData, chatIndex) => {
          const components = chatComponents[chatData.assistantName][subcategory] || [];
          if (components.length > 0) {
            // Wybierz najlepszy komponent (pierwszy z listy) i dodaj go z ceną
            const bestComponent = components[0];
            if (bestComponent.price) {
              subcategoryRow[chatIndex + 1] = `${bestComponent.name} - ${bestComponent.price}`;
            } else {
              subcategoryRow[chatIndex + 1] = bestComponent.name;
            }
          }
        });
        
        summaryDataComponents.push(subcategoryRow);
      });
    });
    
    // Utwórz arkusz SUMMARY
    const summaryWorksheetComponents = XLSX.utils.aoa_to_sheet(summaryDataComponents);
    
    // Dostosuj szerokość kolumn
    const summaryCols = [
      { wch: 25 }, // Components
    ];
    
    // Dodaj szerokość dla każdego czatu
    chatDataArray.forEach(() => {
      summaryCols.push({ wch: 40 }); // Szerokość kolumny dla czatu
    });
    
    summaryWorksheetComponents['!cols'] = summaryCols;
    
    // Dodaj style do arkusza SUMMARY
    if (!summaryWorksheetComponents['!styles']) {
      summaryWorksheetComponents['!styles'] = {};
    }
    
    // Styl nagłówków kolumn
    for (let i = 0; i < headers.length; i++) {
      const col = String.fromCharCode(65 + i); // A, B, C, ...
      summaryWorksheetComponents['!styles'][`${col}1`] = {
        font: { bold: true, color: { rgb: COLORS.WHITE } },
        fill: { fgColor: { rgb: COLORS.HEADER_BG } },
        alignment: { horizontal: 'center' }
      };
    }
    
    // Style dla wierszy kategorii i podkategorii
    for (let rowIndex = 1; rowIndex < summaryDataComponents.length; rowIndex++) {
      const row = summaryDataComponents[rowIndex];
      const excelRowIndex = rowIndex + 1; // +1 bo nagłówki są w wierszu 1
      
      // Sprawdź, czy to wiersz kategorii (kategorie są w computerComponents)
      const isCategory = computerComponents.some(cat => cat.name === row[0]);
      
      if (isCategory) {
        // Styl dla nazwy kategorii
        summaryWorksheetComponents['!styles'][`A${excelRowIndex}`] = {
          font: { bold: true, sz: 12, color: { rgb: COLORS.PRIMARY } },
          fill: { fgColor: { rgb: COLORS.CATEGORY_BG } }
        };
        
        // Styl dla pozostałych komórek w wierszu kategorii
        for (let colIndex = 1; colIndex < headers.length; colIndex++) {
          const col = String.fromCharCode(65 + colIndex);
          summaryWorksheetComponents['!styles'][`${col}${excelRowIndex}`] = {
            fill: { fgColor: { rgb: COLORS.CATEGORY_BG } }
          };
        }
      } else {
        // Styl dla nazwy podkategorii
        summaryWorksheetComponents['!styles'][`A${excelRowIndex}`] = {
          font: { bold: true, color: { rgb: COLORS.SECONDARY } },
          fill: { fgColor: { rgb: COLORS.SUBCATEGORY_BG } }
        };
        
        // Styl dla komórek z danymi komponentów
        for (let colIndex = 1; colIndex < headers.length; colIndex++) {
          const col = String.fromCharCode(65 + colIndex);
          summaryWorksheetComponents['!styles'][`${col}${excelRowIndex}`] = {
            fill: { fgColor: { rgb: COLORS.SUBCATEGORY_BG } },
            alignment: { wrapText: true, vertical: 'top' }
          };
        }
      }
    }
    
    // Dodaj arkusz SUMMARY jako pierwszy arkusz w workbook
    XLSX.utils.book_append_sheet(workbook, summaryWorksheetComponents, 'SUMMARY');
    
    // Dodaj arkusz z informacjami o firmie
    const companyInfoSheet = XLSX.utils.aoa_to_sheet([
      ['PC Store AI - Chat Analysis'],
      [''],
      ['Generated on:', new Date().toLocaleString()],
      ['Number of assistants:', chatDataArray.length.toString()],
      ['Total messages:', chatDataArray.reduce((sum, chat) => sum + chat.messages.length, 0).toString()],
      [''],
      ['This report contains detailed analysis of chat conversations with AI assistants.'],
      ['It includes message statistics, component analysis, and full conversation logs.'],
    ]);
    
    // Dostosuj szerokość kolumn dla arkusza informacyjnego
    companyInfoSheet['!cols'] = [{ wch: 25 }, { wch: 50 }];
    
    // Dodaj style do arkusza informacyjnego
    if (!companyInfoSheet['!styles']) {
      companyInfoSheet['!styles'] = {};
    }
    
    // Styl nagłówka
    companyInfoSheet['!styles']['A1'] = {
      font: { bold: true, sz: 18, color: { rgb: COLORS.PRIMARY } },
      alignment: { horizontal: 'left' }
    };
    
    // Styl dat i liczb
    ['A3', 'A4', 'A5'].forEach(cell => {
      companyInfoSheet['!styles'][cell] = {
        font: { bold: true, color: { rgb: COLORS.SECONDARY } }
      };
    });
    
    // Styl opisu
    ['A7', 'A8'].forEach(cell => {
      companyInfoSheet['!styles'][cell] = {
        font: { italic: true, color: { rgb: COLORS.INFO } }
      };
    });
    
    XLSX.utils.book_append_sheet(workbook, companyInfoSheet, 'Overview');
    
    // Process each chat's data
    chatDataArray.forEach((chatData) => {
      const { assistantName, messages } = chatData;
      
      // Format the conversation for Excel
      const formattedData = messages.map((message) => ({
        'Message #': message.id, // Using ID as timestamp (could be replaced with actual timestamp if available)
        'Role': message.role === 'user' ? 'User' : assistantName,
        'Content': message.content,
      }));
      
      // Create a worksheet for this chat
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      
      // Dostosuj szerokość kolumn
      worksheet['!cols'] = [
        { wch: 10 },  // Message #
        { wch: 15 },  // Role
        { wch: 80 },  // Content
      ];
      
      // Dodaj style do arkusza
      if (!worksheet['!styles']) {
        worksheet['!styles'] = {};
      }
      
      // Styl nagłówków kolumn
      ['A1', 'B1', 'C1'].forEach(cell => {
        worksheet['!styles'][cell] = {
          font: { bold: true, color: { rgb: COLORS.WHITE } },
          fill: { fgColor: { rgb: COLORS.HEADER_BG } },
          alignment: { horizontal: 'center' }
        };
      });
      
      // Dodaj style dla wierszy z wiadomościami użytkownika i asystenta
      formattedData.forEach((_, msgIndex) => {
        const rowIndex = msgIndex + 2; // +2 bo nagłówki są w wierszu 1
        const isUserMessage = formattedData[msgIndex]['Role'] === 'User';
        
        // Styl dla roli
        worksheet['!styles'][`B${rowIndex}`] = {
          font: { 
            bold: true, 
            color: { rgb: isUserMessage ? COLORS.INFO : COLORS.PRIMARY } 
          }
        };
        
        // Styl dla całego wiersza
        ['A', 'B', 'C'].forEach(col => {
          worksheet['!styles'][`${col}${rowIndex}`] = {
            fill: { 
              fgColor: { rgb: isUserMessage ? COLORS.LIGHT : COLORS.WHITE } 
            }
          };
        });
      });
      
      // Add the worksheet to the workbook - używamy nazwy asystenta zamiast Chat 1, Chat 2, itd.
      // Limit do 31 znaków ze względu na ograniczenia Excel
      const sheetName = assistantName.length > 31 ? assistantName.substring(0, 31) : assistantName;
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });
    
    // Generate a summary sheet with statistics
    const statisticsData = chatDataArray.map((chatData) => {
      const userMessages = chatData.messages.filter(m => m.role === 'user').length;
      const assistantMessages = chatData.messages.filter(m => m.role === 'assistant').length;
      const totalChars = chatData.messages.reduce((sum, msg) => sum + msg.content.length, 0);
      const avgMsgLength = Math.round(totalChars / chatData.messages.length) || 0;
      const longestMsg = Math.max(...chatData.messages.map(msg => msg.content.length));
      
      return {
        'Assistant': chatData.assistantName,
        'Total Messages': chatData.messages.length,
        'User Messages': userMessages,
        'Assistant Messages': assistantMessages,
        'Average Message Length (chars)': avgMsgLength,
        'Longest Message (chars)': longestMsg,
        'Total Characters': totalChars,
        'User/Assistant Ratio': userMessages > 0 ? (assistantMessages / userMessages).toFixed(2) : 'N/A'
      };
    });
    
    // Create and add the statistics worksheet
    if (statisticsData.length > 0) {
      const statisticsWorksheet = XLSX.utils.json_to_sheet(statisticsData);
      
      // Dostosuj szerokość kolumn
      statisticsWorksheet['!cols'] = [
        { wch: 10 },  // Assistant
        { wch: 20 },  // Total Messages
        { wch: 15 },  // User Messages
        { wch: 15 },  // Assistant Messages
        { wch: 25 },  // Average Message Length
        { wch: 25 },  // Longest Message
        { wch: 15 },  // Total Characters
        { wch: 15 },  // User/Assistant Ratio
      ];
      
      // Dodaj style do arkusza
      if (!statisticsWorksheet['!styles']) {
        statisticsWorksheet['!styles'] = {};
      }
      
      // Styl nagłówków kolumn
      Object.keys(statisticsData[0]).forEach((key, index) => {
        const col = String.fromCharCode(65 + index); // A, B, C, ...
        statisticsWorksheet['!styles'][`${col}1`] = {
          font: { bold: true, color: { rgb: COLORS.WHITE } },
          fill: { fgColor: { rgb: COLORS.HEADER_BG } },
          alignment: { horizontal: 'center' }
        };
      });
      
      // Styl dla danych
      statisticsData.forEach((_, rowIdx) => {
        const rowIndex = rowIdx + 2; // +2 bo nagłówki są w wierszu 1
        
        // Styl dla nazwy asystenta
        statisticsWorksheet['!styles'][`A${rowIndex}`] = {
          font: { bold: true, color: { rgb: COLORS.PRIMARY } }
        };
        
        statisticsWorksheet['!styles'][`B${rowIndex}`] = {
          font: { italic: true, color: { rgb: COLORS.SECONDARY } }
        };
        
        // Styl dla liczb
        ['C', 'D', 'E', 'F', 'G', 'H', 'I'].forEach(col => {
          statisticsWorksheet['!styles'][`${col}${rowIndex}`] = {
            alignment: { horizontal: 'center' }
          };
        });
        
        // Dodaj tło dla co drugiego wiersza
        if (rowIdx % 2 === 1) {
          Object.keys(statisticsData[0]).forEach((_, colIndex) => {
            const col = String.fromCharCode(65 + colIndex);
            statisticsWorksheet['!styles'][`${col}${rowIndex}`] = {
              ...statisticsWorksheet['!styles'][`${col}${rowIndex}`] || {},
              fill: { fgColor: { rgb: COLORS.LIGHT } }
            };
          });
        }
      });
      
      XLSX.utils.book_append_sheet(workbook, statisticsWorksheet, 'Statistics');
    }
    
    // Generate the Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Save the file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    saveAs(blob, `pc-store-ai-conversations-${timestamp}.xlsx`);
    
    return true;
  } catch (error) {
    console.error('Error generating Excel summary:', error);
    return false;
  }
};

/**
 * Collects chat data from all active chat assistants on the page
 * @param chatRefs Array of refs to chat assistant components
 * @returns Array of chat data
 */
export const collectChatData = (chatRefs: RefObject<ChatAssistantRef | null>[]): ChatData[] => {
  const chatData: ChatData[] = [];
  
  // Collect data from each chat assistant ref
  chatRefs.forEach(ref => {
    if (ref.current) {
      const messages = ref.current.getMessages();
      const assistantName = ref.current.getName();
      
      // Only add chats that have more than just the initial greeting message
      if (messages.length > 1) {
        chatData.push({
          assistantName,
          messages
        });
      }
    }
  });
  
  return chatData;
};

/**
 * Main function to generate Excel summary from all chats
 * @param chatRefs Array of refs to chat assistant components
 */
export const generateAllChatsSummary = (chatRefs: RefObject<ChatAssistantRef | null>[]): boolean => {
  try {
    // Collect data from all chats
    const chatData = collectChatData(chatRefs);
    
    // If no data, show a message
    if (chatData.length === 0) {
      alert('No chat data available to generate summary. Please have at least one conversation with an assistant.');
      return false;
    }
    
    // Generate and download the Excel file
    return generateExcelSummary(chatData);
  } catch (error) {
    console.error('Failed to generate summary:', error);
    alert('Failed to generate summary. Please try again.');
    return false;
  }
};
