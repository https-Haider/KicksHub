"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Product } from "./products"
import { allProducts as defaultProducts } from "./products"

interface ProductsContextType {
  products: Product[]
  addProduct: (product: Omit<Product, "id">) => void
  updateProduct: (id: number, product: Partial<Product>) => void
  deleteProduct: (id: number) => void
  isLoading: boolean
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined)

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(defaultProducts)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedProducts = localStorage.getItem("thriftshoes_products")
    if (savedProducts) {
      try {
        setProducts(JSON.parse(savedProducts))
      } catch {
        setProducts(defaultProducts)
      }
    } else {
      setProducts(defaultProducts)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("thriftshoes_products", JSON.stringify(products))
    }
  }, [products, isLoading])

  const addProduct = (product: Omit<Product, "id">) => {
    const newProduct: Product = {
      ...product,
      id: Math.max(...products.map((p) => p.id), 0) + 1,
    }
    setProducts([...products, newProduct])
  }

  const updateProduct = (id: number, updates: Partial<Product>) => {
    setProducts(products.map((p) => (p.id === id ? { ...p, ...updates } : p)))
  }

  const deleteProduct = (id: number) => {
    setProducts(products.filter((p) => p.id !== id))
  }

  return (
    <ProductsContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, isLoading }}>
      {children}
    </ProductsContext.Provider>
  )
}

export function useProducts() {
  const context = useContext(ProductsContext)
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductsProvider")
  }
  return context
}
