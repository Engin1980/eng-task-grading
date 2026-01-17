import React from "react";

const parseXmlProperties = (xmlString: string): Record<string, any> => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  
  const parseElement = (element: Element): any => {
    const obj: Record<string, any> = {};
    
    // Projdeme všechny přímé potomky <property>
    const children = Array.from(element.children).filter(el => el.tagName === 'property');
    
    children.forEach((prop) => {
      const key = prop.getAttribute('key') || 'unknown';
      
      // Pokud má property v sobě <structure>, jdeme rekurzivně hlouběji
      const structure = prop.querySelector(':scope > structure');
      if (structure) {
        obj[key] = parseElement(structure);
      } else {
        // Jinak vezmeme textovou hodnotu
        obj[key] = prop.textContent?.trim() || null;
      }
    });

    return obj;
  };

  const root = xmlDoc.getElementsByTagName("properties")[0];
  return root ? parseElement(root) : {};
};

export const LogPropertiesViewer = ({ xmlData }: { xmlData: string }) => {
  const formattedJson = React.useMemo(() => {
    try {
      const obj = parseXmlProperties(xmlData);
      return JSON.stringify(obj, null, 2);
    } catch (err) {
      return "Chyba při parsování dat.";
    }
  }, [xmlData]);

  return (
    <div className="font-mono text-sm shadow-lg">
      <pre className="overflow-x-auto whitespace-pre">
        {formattedJson}
      </pre>
    </div>
  );
};