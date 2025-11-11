"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  Search,
  Filter,
  Grid3x3,
  Plus,
  Edit2,
  Upload,
  FileSpreadsheet,
  ArrowLeft,
  X,
  Check,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"
import { usePermisos } from "@/hooks/use-permisos"
import { PERMISOS } from "@/lib/permisos"

interface Producto {
  id: string
  nombre: string
  tipo: string
  categoria: string
  ubicacion: string
  nro_lotes: number
  tamanio_lote: number
  cantidad_disponible: number
  fecha_expiracion: string
  proveedor: string
  umbral_minimo: number
  umbral_maximo: number
  imagen?: string
  costo_unitario?: number
  entrada?: string
}

export function CatalogoProductos() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null)
  const [showDetailView, setShowDetailView] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [excelFile, setExcelFile] = useState<File | null>(null)
  const [isUploadingExcel, setIsUploadingExcel] = useState(false)
  const [showExcelDialog, setShowExcelDialog] = useState(false)

  const [activeFilters, setActiveFilters] = useState({
    tipo: [] as string[],
    categoria: [] as string[],
    proveedor: [] as string[],
    ubicacion: [] as string[],
  })

  const [filterOptions, setFilterOptions] = useState({
    tipos: [] as string[],
    categorias: ["A", "B", "C"],
    proveedores: [] as string[],
    ubicaciones: [] as string[],
  })

  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "",
    ubicacion: "",
    nro_lotes: "",
    tamanio_lote: "",
    cantidad_disponible: "",
    fecha_expiracion: "",
    proveedor: "",
    umbral_minimo: "",
    umbral_maximo: "",
    costo_unitario: "",
    entrada: "",
    imagen: "",
  })

  const [validationErrors, setValidationErrors] = useState({
    nro_lotes: "",
    tamanio_lote: "",
    cantidad_disponible: "",
    umbral_minimo: "",
    umbral_maximo: "",
    costo_unitario: "",
  })

  const [isEditMode, setIsEditMode] = useState(false)
  const [editFormData, setEditFormData] = useState({
    nombre: "",
    tipo: "",
    ubicacion: "",
    nro_lotes: "",
    tamanio_lote: "",
    cantidad_disponible: "",
    fecha_expiracion: "",
    proveedor: "",
    umbral_minimo: "",
    umbral_maximo: "",
    costo_unitario: "",
    entrada: "",
    imagen: "",
  })

  const { tienePermiso, isLoading: isLoadingPermisos } = usePermisos()
  const [tipoUsuario, setTipoUsuario] = useState<string>("")

  useEffect(() => {
    async function loadUsuario() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: usuario } = await supabase.from("usuarios").select("tipo_usuario").eq("id", user.id).single()
        if (usuario) {
          setTipoUsuario(usuario.tipo_usuario)
        }
      }
    }
    loadUsuario()
  }, [])

  const puedeEditarProductos = tipoUsuario === "Director General" || tienePermiso(PERMISOS.EDITAR_PRODUCTOS)

  useEffect(() => {
    loadProductos()
    loadFilterOptions() // Cargar opciones de filtros al montar el componente
  }, [])

  useEffect(() => {
    filterProductos()
  }, [searchTerm, productos, activeFilters]) // Actualizar filtros cuando cambian los filtros activos

  const loadProductos = async () => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      const { data, error } = await supabase.from("productos").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setProductos(data || [])
    } catch (error) {
      console.error("[v0] Error loading productos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadFilterOptions = async () => {
    const supabase = createClient()

    try {
      const { data, error } = await supabase.from("productos").select("tipo, proveedor, ubicacion")

      if (error) throw error

      const tipos = [...new Set(data.map((p) => p.tipo).filter(Boolean))] as string[]
      const proveedores = [...new Set(data.map((p) => p.proveedor).filter(Boolean))] as string[]
      const ubicaciones = [...new Set(data.map((p) => p.ubicacion).filter(Boolean))] as string[]

      setFilterOptions({
        tipos: tipos.sort(),
        categorias: ["A", "B", "C"],
        proveedores: proveedores.sort(),
        ubicaciones: ubicaciones.sort(),
      })
    } catch (error) {
      console.error("[v0] Error loading filter options:", error)
    }
  }

  const filterProductos = () => {
    let filtered = productos

    // Filtro por búsqueda de nombre
    if (searchTerm) {
      filtered = filtered.filter((p) => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Filtros por tipo
    if (activeFilters.tipo.length > 0) {
      filtered = filtered.filter((p) => p.tipo && activeFilters.tipo.includes(p.tipo))
    }

    // Filtros por categoría ABC
    if (activeFilters.categoria.length > 0) {
      filtered = filtered.filter((p) => p.categoria && activeFilters.categoria.includes(p.categoria))
    }

    // Filtros por proveedor
    if (activeFilters.proveedor.length > 0) {
      filtered = filtered.filter((p) => p.proveedor && activeFilters.proveedor.includes(p.proveedor))
    }

    // Filtros por ubicación
    if (activeFilters.ubicacion.length > 0) {
      filtered = filtered.filter((p) => p.ubicacion && activeFilters.ubicacion.includes(p.ubicacion))
    }

    setFilteredProductos(filtered)
  }

  const handleFilterChange = (filterType: keyof typeof activeFilters, value: string, checked: boolean) => {
    setActiveFilters((prev) => {
      const currentValues = prev[filterType]
      const newValues = checked ? [...currentValues, value] : currentValues.filter((v) => v !== value)

      return {
        ...prev,
        [filterType]: newValues,
      }
    })
  }

  const clearAllFilters = () => {
    setActiveFilters({
      tipo: [],
      categoria: [],
      proveedor: [],
      ubicacion: [],
    })
  }

  const getCategoryColor = (categoria: string) => {
    switch (categoria) {
      case "A":
        return "bg-red-500 text-white"
      case "B":
        return "bg-yellow-500 text-white"
      case "C":
        return "bg-green-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true)
    try {
      console.log("[v0] Starting image upload:", file.name)

      const uploadFormData = new FormData()
      uploadFormData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      })

      console.log("[v0] Upload response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("[v0] Upload failed:", errorData)
        if (errorData.error?.includes("not found") || errorData.error?.includes("bucket")) {
          throw new Error("El bucket 'product-images' no existe en Supabase Storage. Por favor créalo primero.")
        }
        throw new Error(errorData.error || errorData.details || "Error al subir imagen")
      }

      const { url } = await response.json()
      console.log("[v0] Image uploaded successfully:", url)

      return url
    } catch (error) {
      console.error("[v0] Error uploading image:", error)
      alert(error instanceof Error ? error.message : "Error al subir la imagen")
    } finally {
      setIsUploadingImage(false)
    }
    return null
  }

  const handleExcelUpload = async () => {
    if (!excelFile) return

    setIsUploadingExcel(true)
    try {
      // Aquí procesarías el Excel y extraerías los datos
      // Por ahora solo mostramos un mensaje
      alert("Funcionalidad de importación de Excel próximamente...")
      setShowExcelDialog(false)
      setExcelFile(null)
    } catch (error) {
      console.error("[v0] Error processing Excel:", error)
      alert("Error al procesar el archivo Excel")
    } finally {
      setIsUploadingExcel(false)
    }
  }

  const validateNumericField = (value: string, fieldName: string) => {
    if (value === "") {
      setValidationErrors((prev) => ({ ...prev, [fieldName]: "" }))
      return true
    }

    const numValue = Number(value)
    if (isNaN(numValue) || numValue < 0) {
      setValidationErrors((prev) => ({
        fieldName: "Entrada Inválida: Números Negativos o Letras.",
      }))
      return false
    }

    setValidationErrors((prev) => ({ ...prev, [fieldName]: "" }))
    return true
  }

  const hasValidationErrors = () => {
    return Object.values(validationErrors).some((error) => error !== "")
  }

  const handleAddProduct = async () => {
    if (hasValidationErrors()) {
      alert("Por favor corrige los errores de validación antes de continuar")
      return
    }

    const supabase = createClient()

    try {
      console.log("[v0] Starting product addition with data:", formData)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Usuario no autenticado")
      }

      console.log("[v0] User authenticated:", user.id)

      if (!formData.nombre) {
        alert("Por favor ingrese el nombre del producto")
        return
      }

      const nroLotes = Number.parseInt(formData.nro_lotes) || 0
      const tamanioLote = Number.parseInt(formData.tamanio_lote) || 0
      const costoUnitario = Number.parseFloat(formData.costo_unitario) || 0

      const productData = {
        nombre: formData.nombre,
        tipo: formData.tipo || null,
        categoria: null, // La categoría se calculará después
        ubicacion: formData.ubicacion || null,
        proveedor: formData.proveedor || null,
        nro_lotes: nroLotes,
        tamanio_lote: tamanioLote,
        cantidad_disponible: Number.parseInt(formData.cantidad_disponible) || 0,
        fecha_expiracion: formData.fecha_expiracion || null,
        umbral_minimo: Number.parseInt(formData.umbral_minimo) || 0,
        umbral_maximo: Number.parseInt(formData.umbral_maximo) || 0,
        costo_unitario: costoUnitario,
        entrada: formData.entrada || null,
        imagen: formData.imagen || null,
        created_by: user.id,
      }

      console.log("[v0] Inserting product data:", productData)

      const { data, error } = await supabase.from("productos").insert(productData).select()

      if (error) {
        console.error("[v0] Supabase error:", error)
        throw new Error(error.message)
      }

      console.log("[v0] Product added successfully:", data)

      await recalcularCategoriasABC() // Recalcular categorías después de agregar

      alert("Producto agregado exitosamente")
      setShowAddDialog(false)
      loadProductos() // Recargar la lista de productos
      resetForm()
    } catch (error) {
      console.error("[v0] Error adding product:", error)
      alert(error instanceof Error ? error.message : "Error al agregar producto")
    }
  }

  const recalcularCategoriasABC = async () => {
    const supabase = createClient()

    try {
      // Obtener todos los productos con sus valores
      const { data: productosData, error } = await supabase.from("productos").select("*")

      if (error) throw error
      if (!productosData || productosData.length === 0) return

      // Calcular el valor total de cada producto
      const productosConValor = productosData.map((p) => ({
        id: p.id,
        valor: (p.nro_lotes || 0) * (p.tamanio_lote || 0) * (p.costo_unitario || 0),
      }))

      // Ordenar por valor descendente
      productosConValor.sort((a, b) => b.valor - a.valor)

      // Calcular el valor total de todos los productos
      const valorTotal = productosConValor.reduce((sum, p) => sum + p.valor, 0)

      // Asignar categorías según el método ABC
      let valorAcumulado = 0
      const updates = []

      for (const producto of productosConValor) {
        valorAcumulado += producto.valor
        const porcentajeAcumulado = valorTotal === 0 ? 0 : (valorAcumulado / valorTotal) * 100 // Evitar división por cero

        let categoria = "C"
        if (porcentajeAcumulado <= 80) {
          // Primeros productos que representan el 80% del valor → Categoría A
          categoria = "A"
        } else if (porcentajeAcumulado <= 95) {
          // Siguientes productos que representan el 15% del valor → Categoría B
          categoria = "B"
        }
        // El resto (últimos 5%) → Categoría C

        updates.push(supabase.from("productos").update({ categoria }).eq("id", producto.id))
      }

      // Ejecutar todas las actualizaciones
      await Promise.all(updates)

      console.log("[v0] Categorías ABC recalculadas exitosamente")
      loadProductos() // Recargar la lista para reflejar las nuevas categorías
    } catch (error) {
      console.error("[v0] Error recalculando categorías ABC:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      tipo: "",
      ubicacion: "",
      nro_lotes: "",
      tamanio_lote: "",
      cantidad_disponible: "",
      fecha_expiracion: "",
      proveedor: "",
      umbral_minimo: "",
      umbral_maximo: "",
      costo_unitario: "",
      entrada: "",
      imagen: "",
    })
    // Resetear errores de validación al resetear el formulario
    setValidationErrors({
      nro_lotes: "",
      tamanio_lote: "",
      cantidad_disponible: "",
      umbral_minimo: "",
      umbral_maximo: "",
      costo_unitario: "",
    })
  }

  const handleProductClick = (producto: Producto) => {
    setSelectedProducto(producto)
    setShowDetailView(true)
  }

  const handleBackToList = () => {
    setShowDetailView(false)
    setSelectedProducto(null)
  }

  const handleStartEdit = () => {
    if (!selectedProducto) return

    setEditFormData({
      nombre: selectedProducto.nombre || "",
      tipo: selectedProducto.tipo || "",
      ubicacion: selectedProducto.ubicacion || "",
      nro_lotes: selectedProducto.nro_lotes?.toString() || "",
      tamanio_lote: selectedProducto.tamanio_lote?.toString() || "",
      cantidad_disponible: selectedProducto.cantidad_disponible?.toString() || "",
      fecha_expiracion: selectedProducto.fecha_expiracion || "",
      proveedor: selectedProducto.proveedor || "",
      umbral_minimo: selectedProducto.umbral_minimo?.toString() || "",
      umbral_maximo: selectedProducto.umbral_maximo?.toString() || "",
      costo_unitario: selectedProducto.costo_unitario?.toString() || "",
      entrada: selectedProducto.entrada || "",
      imagen: selectedProducto.imagen || "",
    })
    setIsEditMode(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedProducto) return

    const supabase = createClient()
    setIsLoading(true)

    try {
      const nroLotes = Number.parseInt(editFormData.nro_lotes) || 0
      const tamanioLote = Number.parseInt(editFormData.tamanio_lote) || 0
      const costoUnitario = Number.parseFloat(editFormData.costo_unitario) || 0

      const updateData = {
        nombre: editFormData.nombre,
        tipo: editFormData.tipo || null,
        ubicacion: editFormData.ubicacion || null,
        proveedor: editFormData.proveedor || null,
        nro_lotes: nroLotes,
        tamanio_lote: tamanioLote,
        cantidad_disponible: Number.parseInt(editFormData.cantidad_disponible) || 0,
        fecha_expiracion: editFormData.fecha_expiracion || null,
        umbral_minimo: Number.parseInt(editFormData.umbral_minimo) || 0,
        umbral_maximo: Number.parseInt(editFormData.umbral_maximo) || 0,
        costo_unitario: costoUnitario,
        entrada: editFormData.entrada || null,
        imagen: editFormData.imagen || null,
      }

      const { error } = await supabase.from("productos").update(updateData).eq("id", selectedProducto.id)

      if (error) throw error

      await recalcularCategoriasABC() // Recalcular categorías después de editar

      alert("Producto actualizado exitosamente")
      setIsEditMode(false)
      await loadProductos()

      // Actualizar el producto seleccionado con los nuevos datos
      const { data: updatedProduct } = await supabase
        .from("productos")
        .select("*")
        .eq("id", selectedProducto.id)
        .single()

      if (updatedProduct) {
        setSelectedProducto(updatedProduct)
      }
    } catch (error) {
      console.error("[v0] Error updating product:", error)
      alert(error instanceof Error ? error.message : "Error al actualizar producto")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
  }

  const handleDeleteProduct = async () => {
    if (!selectedProducto) return

    const confirmDelete = confirm(
      `¿Estás seguro de que deseas eliminar el producto "${selectedProducto.nombre}"? Esta acción no se puede deshacer.`,
    )

    if (!confirmDelete) return

    const supabase = createClient()
    setIsLoading(true)

    try {
      const { error } = await supabase.from("productos").delete().eq("id", selectedProducto.id)

      if (error) throw error

      await recalcularCategoriasABC() // Recalcular categorías después de eliminar

      alert("Producto eliminado exitosamente")
      setShowDetailView(false)
      setSelectedProducto(null)
      await loadProductos()
    } catch (error) {
      console.error("[v0] Error deleting product:", error)
      alert(error instanceof Error ? error.message : "Error al eliminar producto")
    } finally {
      setIsLoading(false)
    }
  }

  if (showDetailView && selectedProducto) {
    return (
      <div className="space-y-6">
        <Button
          onClick={handleBackToList}
          className="rounded-full px-6 py-3 text-base font-medium cursor-pointer transition-colors bg-[#0D2646] hover:bg-[#487FBB] text-white"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver al Catálogo
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8">
          <div>
            <div className="bg-white rounded-3xl border-8 overflow-hidden w-full" style={{ borderColor: "#0D2646" }}>
              <div className="bg-white p-8 h-64">
                <div className="h-full relative bg-white rounded-2xl flex items-center justify-center">
                  {isEditMode ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                      {editFormData.imagen ? (
                        <Image
                          src={editFormData.imagen || "/placeholder.svg"}
                          alt={editFormData.nombre}
                          width={200}
                          height={200}
                          className="object-contain max-h-40"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <p className="text-sm text-muted-foreground">Sin imagen</p>
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById("edit-image-upload")?.click()}
                        disabled={isUploadingImage}
                        className="cursor-pointer"
                      >
                        <Upload className="h-3 w-3 mr-1" />
                        {isUploadingImage ? "Subiendo..." : "Cambiar"}
                      </Button>
                      <input
                        id="edit-image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleImageUpload(file).then((url) => {
                              if (url) {
                                setEditFormData((prev) => ({ ...prev, imagen: url }))
                              }
                            })
                          }
                        }}
                      />
                    </div>
                  ) : selectedProducto.imagen ? (
                    <Image
                      src={selectedProducto.imagen || "/placeholder.svg"}
                      alt={selectedProducto.nombre}
                      width={300}
                      height={300}
                      className="object-contain w-full h-full"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <p className="text-sm text-muted-foreground">{selectedProducto.nombre}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="relative p-8 text-white min-h-[500px]" style={{ backgroundColor: "#0D2646" }}>
                {isEditMode ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-nombre" className="text-white">
                        Nombre del Producto
                      </Label>
                      <Input
                        id="edit-nombre"
                        value={editFormData.nombre}
                        onChange={(e) => setEditFormData({ ...editFormData, nombre: e.target.value })}
                        className="bg-white text-black"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-tipo" className="text-white">
                        Tipo
                      </Label>
                      <Input
                        id="edit-tipo"
                        value={editFormData.tipo}
                        onChange={(e) => setEditFormData({ ...editFormData, tipo: e.target.value })}
                        className="bg-white text-black"
                        placeholder="Ej: Alimento, Bebida, Limpieza"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-ubicacion" className="text-white">
                        Ubicación
                      </Label>
                      <Input
                        id="edit-ubicacion"
                        value={editFormData.ubicacion}
                        onChange={(e) => setEditFormData({ ...editFormData, ubicacion: e.target.value })}
                        className="bg-white text-black"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="edit-nro-lotes" className="text-white text-sm">
                          Nro Lotes
                        </Label>
                        <Input
                          id="edit-nro-lotes"
                          type="number"
                          value={editFormData.nro_lotes}
                          onChange={(e) => setEditFormData({ ...editFormData, nro_lotes: e.target.value })}
                          className="bg-white text-black"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-tamanio-lote" className="text-white text-sm">
                          Tamaño Lote
                        </Label>
                        <Input
                          id="edit-tamanio-lote"
                          type="number"
                          value={editFormData.tamanio_lote}
                          onChange={(e) => setEditFormData({ ...editFormData, tamanio_lote: e.target.value })}
                          className="bg-white text-black"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="edit-cantidad" className="text-white">
                        Cantidad Disponible
                      </Label>
                      <Input
                        id="edit-cantidad"
                        type="number"
                        value={editFormData.cantidad_disponible}
                        onChange={(e) => setEditFormData({ ...editFormData, cantidad_disponible: e.target.value })}
                        className="bg-white text-black"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-expiracion" className="text-white">
                        Fecha Expiración
                      </Label>
                      <Input
                        id="edit-expiracion"
                        type="date"
                        value={editFormData.fecha_expiracion}
                        onChange={(e) => setEditFormData({ ...editFormData, fecha_expiracion: e.target.value })}
                        className="bg-white text-black"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-proveedor" className="text-white">
                        Proveedor
                      </Label>
                      <Input
                        id="edit-proveedor"
                        value={editFormData.proveedor}
                        onChange={(e) => setEditFormData({ ...editFormData, proveedor: e.target.value })}
                        className="bg-white text-black"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="edit-umbral-min" className="text-white text-sm">
                          Umbral Mín
                        </Label>
                        <Input
                          id="edit-umbral-min"
                          type="number"
                          value={editFormData.umbral_minimo}
                          onChange={(e) => setEditFormData({ ...editFormData, umbral_minimo: e.target.value })}
                          className="bg-white text-black"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-umbral-max" className="text-white text-sm">
                          Umbral Máx
                        </Label>
                        <Input
                          id="edit-umbral-max"
                          type="number"
                          value={editFormData.umbral_maximo}
                          onChange={(e) => setEditFormData({ ...editFormData, umbral_maximo: e.target.value })}
                          className="bg-white text-black"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={handleSaveEdit}
                        disabled={isLoading}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Guardar
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        variant="outline"
                        className="flex-1 bg-white text-black hover:bg-gray-100 cursor-pointer"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleDeleteProduct}
                        disabled={isLoading}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-3xl font-bold uppercase mb-6">{selectedProducto.nombre}</h2>
                    <div className="space-y-3 text-base">
                      <p>
                        <strong>ID:</strong> {selectedProducto.id.substring(0, 4).toUpperCase()}
                      </p>
                      {selectedProducto.tipo && (
                        <p>
                          <strong>Tipo:</strong> {selectedProducto.tipo}
                        </p>
                      )}
                      <p>
                        <strong>Ubicación:</strong> {selectedProducto.ubicacion || "No especificada"}
                      </p>
                      <p>
                        <strong>Tamaño del Lote:</strong> {selectedProducto.tamanio_lote?.toLocaleString()} unidades
                      </p>
                      <p>
                        <strong>Cantidad Disponible:</strong> {selectedProducto.cantidad_disponible?.toLocaleString()}
                      </p>
                      <p>
                        <strong>Expiración:</strong>{" "}
                        {selectedProducto.fecha_expiracion
                          ? new Date(selectedProducto.fecha_expiracion).toLocaleDateString()
                          : "No especificada"}
                      </p>
                      <p>
                        <strong>Proveedores:</strong> {selectedProducto.proveedor || "No especificado"}
                      </p>
                      <p>
                        <strong>Umbral Mínimo:</strong> {selectedProducto.umbral_minimo} unidades
                      </p>
                      <p>
                        <strong>Umbral Máximo:</strong> {selectedProducto.umbral_maximo} unidades
                      </p>
                    </div>
                    {puedeEditarProductos ? (
                      <button
                        onClick={handleStartEdit}
                        className="absolute bottom-6 right-6 bg-white rounded-full p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <Edit2 className="h-5 w-5" style={{ color: "#0D2646" }} />
                      </button>
                    ) : (
                      <div className="absolute bottom-6 right-6 bg-gray-300 rounded-full p-3 cursor-not-allowed opacity-50">
                        <Edit2 className="h-5 w-5" style={{ color: "#0D2646" }} />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: "#487FBB" }}>
                Resumen Inversión Inicial
              </h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr style={{ backgroundColor: "#487FBB", color: "white" }}>
                    <th className="border border-gray-300 px-4 py-2 text-left">Entrada</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Nro Lotes</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Unidades</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Precio Compra</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Total Compra</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">
                      {selectedProducto.entrada || "Inventario Inicial"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{selectedProducto.nro_lotes}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {(selectedProducto.nro_lotes * selectedProducto.tamanio_lote).toLocaleString()}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">${selectedProducto.costo_unitario || 0}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      $
                      {(
                        (selectedProducto.costo_unitario || 0) *
                        selectedProducto.nro_lotes *
                        selectedProducto.tamanio_lote
                      ).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: "#487FBB" }}>
                Resumen de Ganancias
              </h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr style={{ backgroundColor: "#487FBB", color: "white" }}>
                    <th className="border border-gray-300 px-4 py-2 text-left">Movimientos</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Unidades</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Fecha Movimiento</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Precio Venta</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Ganancias</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2" colSpan={5}>
                      No hay movimientos registrados
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: "#487FBB" }}>
                Resumen de Traslados
              </h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr style={{ backgroundColor: "#487FBB", color: "white" }}>
                    <th className="border border-gray-300 px-4 py-2 text-left">Sede Origen</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Destino</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Fecha</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Motivo</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Encargado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2" colSpan={5}>
                      No hay traslados registrados
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <div
            className="flex items-center gap-2 bg-white border-4 rounded-full px-4 py-3"
            style={{ borderColor: "#0D2646" }}
          >
            <Search className="h-5 w-5" style={{ color: "#0D2646" }} />
            <Input
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
            />
          </div>
        </div>

        <Button
          onClick={() => setShowFilterDialog(true)}
          className="rounded-full px-6 py-6 text-base font-medium cursor-pointer transition-colors bg-[#0D2646] hover:bg-[#487FBB] text-white"
        >
          <Filter className="h-5 w-5 mr-2" />
          Aplicar Filtro
        </Button>

        <Button
          onClick={() => setShowCategoryDialog(true)}
          className="rounded-full px-6 py-6 text-base font-medium cursor-pointer transition-colors bg-[#0D2646] hover:bg-[#487FBB] text-white"
        >
          <Grid3x3 className="h-5 w-5 mr-2" />
          Crear Categoría
        </Button>

        <Button
          onClick={() => setShowExcelDialog(true)}
          className="rounded-full px-6 py-6 text-base font-medium cursor-pointer transition-colors bg-[#0D2646] hover:bg-[#487FBB] text-white"
        >
          <FileSpreadsheet className="h-5 w-5 mr-2" />
          Importar Excel
        </Button>

        <Button
          onClick={() => setShowAddDialog(true)}
          className="rounded-full px-6 py-6 text-base font-medium cursor-pointer transition-colors bg-[#0D2646] hover:bg-[#487FBB] text-white"
        >
          <Plus className="h-5 w-5 mr-2" />
          Agregar Producto
        </Button>
      </div>

      {(activeFilters.tipo.length > 0 ||
        activeFilters.categoria.length > 0 ||
        activeFilters.proveedor.length > 0 ||
        activeFilters.ubicacion.length > 0) && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium">Filtros activos:</span>
          {activeFilters.tipo.map((tipo) => (
            <div
              key={tipo}
              className="px-3 py-1 rounded-full text-sm flex items-center gap-2 text-white"
              style={{ backgroundColor: "#487FBB" }}
            >
              <span>Tipo: {tipo}</span>
              <button
                onClick={() => handleFilterChange("tipo", tipo, false)}
                className="hover:bg-white/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {activeFilters.categoria.map((cat) => (
            <div
              key={cat}
              className="px-3 py-1 rounded-full text-sm flex items-center gap-2 text-white"
              style={{ backgroundColor: "#487FBB" }}
            >
              <span>Categoría: {cat}</span>
              <button
                onClick={() => handleFilterChange("categoria", cat, false)}
                className="hover:bg-white/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {activeFilters.proveedor.map((prov) => (
            <div
              key={prov}
              className="px-3 py-1 rounded-full text-sm flex items-center gap-2 text-white"
              style={{ backgroundColor: "#487FBB" }}
            >
              <span>Proveedor: {prov}</span>
              <button
                onClick={() => handleFilterChange("proveedor", prov, false)}
                className="hover:bg-white/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {activeFilters.ubicacion.map((ubi) => (
            <div
              key={ubi}
              className="px-3 py-1 rounded-full text-sm flex items-center gap-2 text-white"
              style={{ backgroundColor: "#487FBB" }}
            >
              <span>Ubicación: {ubi}</span>
              <button
                onClick={() => handleFilterChange("ubicacion", ubi, false)}
                className="hover:bg-white/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <Button onClick={clearAllFilters} variant="ghost" size="sm" className="cursor-pointer">
            Limpiar todos
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Cargando productos...</p>
        </div>
      ) : filteredProductos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron productos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProductos.map((producto) => (
            <button
              key={producto.id}
              onClick={() => handleProductClick(producto)}
              className="bg-white rounded-3xl p-6 border-8 hover:shadow-lg transition-shadow cursor-pointer relative"
              style={{ borderColor: "#0D2646" }}
            >
              <div className="aspect-square relative bg-white rounded-2xl flex items-center justify-center mb-4">
                {producto.imagen ? (
                  <Image
                    src={producto.imagen || "/placeholder.svg"}
                    alt={producto.nombre}
                    width={200}
                    height={200}
                    className="object-contain w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 rounded-2xl">
                    Sin imagen
                  </div>
                )}
              </div>
              <h3 className="text-center font-semibold text-[#0d2646] text-base">{producto.nombre}</h3>
              <p className="text-center text-sm text-gray-600 mt-1">
                {producto.cantidad_disponible?.toLocaleString()} unidades
              </p>
            </button>
          ))}
        </div>
      )}

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Producto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre" className="mb-2 block">
                  Nombre del Producto
                </Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="tipo" className="mb-2 block">
                  Tipo
                </Label>
                <Input
                  id="tipo"
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  placeholder="Ej: Alimento, Bebida, Limpieza"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ubicacion" className="mb-2 block">
                  Ubicación
                </Label>
                <Input
                  id="ubicacion"
                  value={formData.ubicacion}
                  onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="proveedor" className="mb-2 block">
                  Proveedor
                </Label>
                <Input
                  id="proveedor"
                  value={formData.proveedor}
                  onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="entrada" className="mb-2 block">
                  Tipo de Entrada
                </Label>
                <Select
                  value={formData.entrada}
                  onValueChange={(value) => setFormData({ ...formData, entrada: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tipo de entrada" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inventario Inicial">Inventario Inicial</SelectItem>
                    <SelectItem value="Reabastecimiento">Reabastecimiento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="nro_lotes" className="mb-2 block">
                  Número de Lotes
                </Label>
                <Input
                  id="nro_lotes"
                  type="number"
                  min="0"
                  value={formData.nro_lotes}
                  onChange={(e) => {
                    setFormData({ ...formData, nro_lotes: e.target.value })
                    validateNumericField(e.target.value, "nro_lotes")
                  }}
                />
                {validationErrors.nro_lotes && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.nro_lotes}</p>
                )}
              </div>
              <div>
                <Label htmlFor="tamanio_lote" className="mb-2 block">
                  Tamaño del Lote
                </Label>
                <Input
                  id="tamanio_lote"
                  type="number"
                  min="0"
                  value={formData.tamanio_lote}
                  onChange={(e) => {
                    setFormData({ ...formData, tamanio_lote: e.target.value })
                    validateNumericField(e.target.value, "tamanio_lote")
                  }}
                />
                {validationErrors.tamanio_lote && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.tamanio_lote}</p>
                )}
              </div>
              <div>
                <Label htmlFor="cantidad_disponible" className="mb-2 block">
                  Cantidad Disponible
                </Label>
                <Input
                  id="cantidad_disponible"
                  type="number"
                  min="0"
                  value={formData.cantidad_disponible}
                  onChange={(e) => {
                    setFormData({ ...formData, cantidad_disponible: e.target.value })
                    validateNumericField(e.target.value, "cantidad_disponible")
                  }}
                />
                {validationErrors.cantidad_disponible && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.cantidad_disponible}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="umbral_minimo" className="mb-2 block">
                  Umbral Mínimo
                </Label>
                <Input
                  id="umbral_minimo"
                  type="number"
                  min="0"
                  value={formData.umbral_minimo}
                  onChange={(e) => {
                    setFormData({ ...formData, umbral_minimo: e.target.value })
                    validateNumericField(e.target.value, "umbral_minimo")
                  }}
                />
                {validationErrors.umbral_minimo && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.umbral_minimo}</p>
                )}
              </div>
              <div>
                <Label htmlFor="umbral_maximo" className="mb-2 block">
                  Umbral Máximo
                </Label>
                <Input
                  id="umbral_maximo"
                  type="number"
                  min="0"
                  value={formData.umbral_maximo}
                  onChange={(e) => {
                    setFormData({ ...formData, umbral_maximo: e.target.value })
                    validateNumericField(e.target.value, "umbral_maximo")
                  }}
                />
                {validationErrors.umbral_maximo && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.umbral_maximo}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="costo_unitario" className="mb-2 block">
                  Costo Unitario
                </Label>
                <Input
                  id="costo_unitario"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.costo_unitario}
                  onChange={(e) => {
                    setFormData({ ...formData, costo_unitario: e.target.value })
                    validateNumericField(e.target.value, "costo_unitario")
                  }}
                />
                {validationErrors.costo_unitario && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.costo_unitario}</p>
                )}
              </div>
              <div>
                <Label htmlFor="fecha_expiracion" className="mb-2 block">
                  Fecha de Expiración
                </Label>
                <Input
                  id="fecha_expiracion"
                  type="date"
                  value={formData.fecha_expiracion}
                  onChange={(e) => setFormData({ ...formData, fecha_expiracion: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="imagen" className="mb-2 block">
                Imagen del Producto
              </Label>
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("image-upload")?.click()}
                  disabled={isUploadingImage}
                  className="w-full cursor-pointer transition-colors bg-[#0D2646] hover:bg-[#487FBB] text-white"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploadingImage ? "Subiendo imagen..." : "Subir Imagen"}
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setImageFile(file)
                      handleImageUpload(file).then((url) => {
                        if (url) {
                          setFormData((prev) => ({ ...prev, imagen: url }))
                        }
                      })
                    }
                  }}
                />
                {formData.imagen && (
                  <div className="relative w-32 h-32 border rounded">
                    <img
                      src={formData.imagen || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddProduct}
                disabled={isLoading}
                className="flex-1 cursor-pointer transition-colors bg-[#0D2646] hover:bg-[#487FBB] text-white"
              >
                Agregar Producto
              </Button>
              <Button onClick={() => setShowAddDialog(false)} variant="outline" className="flex-1 cursor-pointer">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Filtrar Productos</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Filtro por Tipo */}
            <div>
              <h3 className="font-semibold mb-3">Tipo de Producto</h3>
              <div className="space-y-2">
                {filterOptions.tipos.length > 0 ? (
                  filterOptions.tipos.map((tipo) => (
                    <div key={tipo} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tipo-${tipo}`}
                        checked={activeFilters.tipo.includes(tipo)}
                        onCheckedChange={(checked) => handleFilterChange("tipo", tipo, checked as boolean)}
                      />
                      <label htmlFor={`tipo-${tipo}`} className="text-sm cursor-pointer">
                        {tipo}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No hay tipos disponibles</p>
                )}
              </div>
            </div>

            {/* Filtro por Categoría ABC */}
            <div>
              <h3 className="font-semibold mb-3">Categoría ABC</h3>
              <div className="space-y-2">
                {filterOptions.categorias.map((cat) => (
                  <div key={cat} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cat-${cat}`}
                      checked={activeFilters.categoria.includes(cat)}
                      onCheckedChange={(checked) => handleFilterChange("categoria", cat, checked as boolean)}
                    />
                    <label htmlFor={`cat-${cat}`} className="text-sm cursor-pointer">
                      Categoría {cat}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Filtro por Proveedor */}
            <div>
              <h3 className="font-semibold mb-3">Proveedor</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {filterOptions.proveedores.length > 0 ? (
                  filterOptions.proveedores.map((prov) => (
                    <div key={prov} className="flex items-center space-x-2">
                      <Checkbox
                        id={`prov-${prov}`}
                        checked={activeFilters.proveedor.includes(prov)}
                        onCheckedChange={(checked) => handleFilterChange("proveedor", prov, checked as boolean)}
                      />
                      <label htmlFor={`prov-${prov}`} className="text-sm cursor-pointer">
                        {prov}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No hay proveedores disponibles</p>
                )}
              </div>
            </div>

            {/* Filtro por Ubicación */}
            <div>
              <h3 className="font-semibold mb-3">Ubicación</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {filterOptions.ubicaciones.length > 0 ? (
                  filterOptions.ubicaciones.map((ubi) => (
                    <div key={ubi} className="flex items-center space-x-2">
                      <Checkbox
                        id={`ubi-${ubi}`}
                        checked={activeFilters.ubicacion.includes(ubi)}
                        onCheckedChange={(checked) => handleFilterChange("ubicacion", ubi, checked as boolean)}
                      />
                      <label htmlFor={`ubi-${ubi}`} className="text-sm cursor-pointer">
                        {ubi}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No hay ubicaciones disponibles</p>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => setShowFilterDialog(false)}
                className="flex-1 cursor-pointer transition-colors bg-[#0D2646] hover:bg-[#487FBB] text-white"
              >
                Aplicar Filtros
              </Button>
              <Button onClick={clearAllFilters} variant="outline" className="flex-1 cursor-pointer bg-transparent">
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Categoría</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">Funcionalidad de categorías personalizadas próximamente...</p>
        </DialogContent>
      </Dialog>

      <Dialog open={showExcelDialog} onOpenChange={setShowExcelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar Productos desde Excel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Sube un archivo Excel (.xlsx) con las columnas: nombre, categoria, ubicacion, proveedor, nro_lotes,
              tamanio_lote, cantidad_disponible, umbral_minimo, umbral_maximo, costo_unitario, fecha_expiracion,
              entrada, imagen_url
            </p>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                id="excel-upload"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) setExcelFile(file)
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("excel-upload")?.click()}
                className="cursor-pointer"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Seleccionar Archivo Excel
              </Button>
              {excelFile && <p className="mt-2 text-sm">{excelFile.name}</p>}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleExcelUpload}
                disabled={!excelFile || isUploadingExcel}
                className="flex-1 cursor-pointer transition-colors bg-[#0D2646] hover:bg-[#487FBB] text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploadingExcel ? "Procesando..." : "Importar"}
              </Button>
              <Button onClick={() => setShowExcelDialog(false)} variant="outline" className="flex-1 cursor-pointer">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
