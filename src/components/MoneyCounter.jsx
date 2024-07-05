import React, { useEffect, useState } from "react";
import denominations from "../assets/data/denominations";
import axios from "axios";

const MoneyCounter = () => {
  const [amounts, setAmounts] = useState(
    JSON.parse(localStorage.getItem("amounts")) || {}
  );
  const [currency, setCurrency] = useState("MXN");
  const [exchangeRate, setExchangeRate] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem("amounts")) {
      const resetAmounts = denominations.reduce(
        (acc, curr) => ({
          ...acc,
          [curr.name]: 0,
        }),
        {}
      );
      localStorage.setItem("amounts", JSON.stringify(resetAmounts));
      setAmounts(resetAmounts);
    }
  }, []);

  useEffect(() => {
    axios
      .get("https://open.er-api.com/v6/latest/MXN")
      .then((response) => {
        setExchangeRate(response.data.rates.USD);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    localStorage.setItem("amounts", JSON.stringify(amounts));
  }, [amounts]);

  const handleInputChange = (event, denomination) => {
    const value = event.target.value.replace(/^0+/, "");
    setAmounts((prevState) => ({
      ...prevState,
      [denomination]: value === "" ? "" : Number(value),
    }));
  };

  const handleDenominationReset = (denomination) => {
    setAmounts((prevState) => ({
      ...prevState,
      [denomination]: 0,
    }));
  };

  const handleResetAll = () => {
    const resetAmounts = denominations.reduce(
      (acc, curr) => ({
        ...acc,
        [curr.name]: 0,
      }),
      {}
    );
    localStorage.setItem("amounts", JSON.stringify(resetAmounts));
    setAmounts(resetAmounts);
  };

  const calculateTotal = () => {
    return denominations.reduce((acc, curr) => {
      const amount = amounts[curr.name] || 0;
      return acc + amount * curr.value;
    }, 0);
  };

  const calculateTotalInUSD = () => {
    const total = calculateTotal();
    const totalConverted =
      currency === "USD"
        ? total * exchangeRate.toFixed(2)
        : total / exchangeRate.toFixed(2);
    return totalConverted;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-red-800">
      <div className="border-2 border-white p-8 space-y-4">
        <h1 className="text-white text-3xl font-bold text-center">
          Contador de dinero
        </h1>
        <hr className="border-2 border-white" />
        {/* Inputs y botones por fila */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {denominations.map(({ name, value }, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 md:space-x-4"
            >
              <div className="relative w-full">
                <label
                  htmlFor={`input${index}`}
                  className="absolute left-3 top-0 px-1 bg-red-800 text-white text-sm transition-all transform -translate-y-1/2 peer-placeholder-shown:top-1/2 peer-placeholder-shown:left-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:top-0 peer-focus:left-3 peer-focus:text-sm"
                >
                  {name}
                </label>
                <input
                  type="number"
                  id={`input${index}`}
                  value={amounts[name] === undefined ? "" : amounts[name]}
                  onChange={(event) => handleInputChange(event, name)}
                  className="w-full p-4 pt-6 border-2 border-white rounded bg-red-800 text-white peer placeholder-transparent"
                  placeholder="Ingresa cantidad"
                />
              </div>
              <button
                onClick={() => handleDenominationReset(name)}
                className="border-2 border-white bg-red-600 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Borrar
              </button>
            </div>
          ))}
        </div>
        {/* Botones adicionales y total */}
        <div className="flex flex-row items-center justify-center space-x-4">
          <button
            onClick={handleResetAll}
            className="border-2 border-white bg-red-600 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Borrar todo
          </button>
          <button
            onClick={() => setCurrency(currency === "MXN" ? "USD" : "MXN")}
            className="border-2 border-white bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Convertir a {currency === "MXN" ? "USD" : "MXN"}
          </button>
        </div>
        <div className="flex flex-row items-center justify-center space-x-4">
          <span className="text-white text-2xl">
            Total{" "}
            {currency === "MXN"
              ? `$${calculateTotal()} MXN`
              : `$${calculateTotalInUSD()} USD`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MoneyCounter;
