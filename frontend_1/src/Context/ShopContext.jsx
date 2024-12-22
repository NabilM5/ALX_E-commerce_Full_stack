import React, { createContext } from "react";
import all_product from "../Components/Assets/all_product";

export const ShopContext = createContext(null);

const ShopContextProvider = (props) => {
    
    const contxtValue = {all_product}

    return (
        <ShopContext.Provider value={contxtValue}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider;