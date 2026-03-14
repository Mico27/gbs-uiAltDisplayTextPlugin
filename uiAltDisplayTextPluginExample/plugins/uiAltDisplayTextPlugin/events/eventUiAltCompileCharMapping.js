export const id = "EVENT_COMPILE_CHAR_MAPPING";
export const name = "Compile character mappings";
export const groups = ["EVENT_GROUP_DIALOGUE"];

export const autoLabel = (fetchArg) => {
  return `Compile character mappings`;
};

export const fields = [].concat(
  [
    {
      label: "Ascii value to Tileset VRAM Idx mapping",
    }, 
    {
        key: "__collapseAll",
        label: "Show mappings",
        type: "collapsable",
        defaultValue: true,
    }
  ],
  
  Array(96)
    .fill()
    .reduce((arr, _, i) => {      
      arr.push({
    type: "group",
	wrapItems: false,
    fields: [
	  {
        key: `tileset_idx_${i}`,
        type: "number",
        label: `${(i == 0)? 'Space' : String.fromCharCode(i + 32)} (${i + 32})`,
        defaultValue: 0,
        conditions: [
            {
                key: "__collapseAll",
                ne: true,
            },
        ],
      }
    ],
  });
      return arr;
    }, []),
  [
    {
        key: "__collapseExtra",
        label: "Show extra mappings",
        type: "collapsable",
        defaultValue: false,
        conditions: [
            {
                key: "__collapseAll",
                ne: true,
            },
        ],
    },
  ],
  Array(128)
    .fill()
    .reduce((arr, _, i) => {      
      arr.push({
    type: "group",
	wrapItems: false,
    fields: [
	  {
        key: `tileset_idx_${i + 128}`,
        type: "number",
        label: `${String.fromCharCode(i + 128)} (${i + 128})`,
        defaultValue: 0,
        conditions: [
            {
                key: "__collapseExtra",
                ne: true,
            },
            {
                key: "__collapseAll",
                ne: true,
            },
        ],
      }
    ],
  });
      return arr;
    }, []),
);

const background_cache = {};

export const compile = (input, helpers) => {
  const { options, _callNative, _stackPushConst, _stackPush, _stackPop, _addComment, _declareLocal, variableSetToScriptValue, writeAsset } = helpers;
  
  const { scenes, scene, engineFields } = options;
  
  let mappingData = "";

  let idx = 0;
  for (let y = 0; y < 16; y++){
    for (let x = 0; x < 16; x++, idx++){
  	    mappingData += `${(idx < 32)? input[`tilesetId_${idx - 32}`]: 0}, `;
    }
    mappingData += '\n    ';
  }
  const mapping_symbol = _getAvailableSymbol('char_tileset_mapping');
  
  writeAsset(
        `${mapping_symbol}.c`,
        `#pragma bank 255
	    
	    #include "data/${mapping_symbol}.h"
	    #include "bankdata.h"
	    
	    BANKREF(${mapping_symbol})
	    
	    const unsigned char ${mapping_symbol}[] = {
	   	    ${mappingData}
	    };`
	);
	  
  writeAsset(
	  `${mapping_symbol}.h`,
	  `#ifndef __${mapping_symbol}_INCLUDE__
	  #define __${mapping_symbol}_INCLUDE__
	  
	  #include "bankdata.h"
	  	  	  
	  BANKREF_EXTERN(${mapping_symbol})
	  extern const unsigned char ${mapping_symbol}[];
	  
	  #endif
	  `
    );  
  
};
