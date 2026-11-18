export interface CarBrand {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface CarModel extends CarBrand {
  carBrand: Pick<CarBrand, 'id' | 'name'>
}

export interface CarGeneration {
  id: string
  startProduction: number
  endProduction: number | null
  carModel: Pick<CarModel, 'id' | 'name' | 'carBrand'>
  createdAt: string
  updatedAt: string
}

export type VehicleRecord =
  | { type: 'brand'; item: CarBrand }
  | { type: 'model'; item: CarModel }
  | { type: 'generation'; item: CarGeneration }

export type VehicleEditorState =
  | { type: 'brand'; item?: CarBrand }
  | { type: 'model'; carBrand: CarModel['carBrand']; item?: CarModel }
  | { type: 'generation'; carModel: CarGeneration['carModel']; item?: CarGeneration }

export interface CarModelInput {
  name: string
  carBrandId: string
}

export interface CarGenerationInput {
  startProduction: number
  endProduction: number | null
  carModelId: string
}
