export type Vec3 = [number, number, number];
export type Vec2 = [number, number];

export interface AlignmentManifest {
  schemaVersion: 1;
  surveyRef: string;
  matterportModelId: string;
  matterpakOrderedAt?: string;
  notes?: string;
  transform: {
    position: Vec3;
    rotationEulerDeg: Vec3;
    scale: Vec3;
  };
  controlPoints?: Array<{
    label: string;
    surveyPosition: Vec3;
    meshPosition: Vec3;
    toleranceM?: number;
  }>;
  parityTargets?: {
    maxWallDeltaM?: number;
    maxStationDeltaM?: number;
  };
}

export interface MatterpakBundle {
  rootDir: string;
  objPath: string;
  mtlPath?: string;
  texturePaths: string[];
  floorPlanPaths: string[];
  pointCloudPath?: string;
}

export interface HouseLayoutGeometry {
  source: 'matterport';
  matterportModelId: string;
  matterpakBundleId?: string;
  mesh: {
    format: 'obj';
    uri: string;
    materialUri?: string;
    textureUris?: string[];
    transform: {
      position: Vec3;
      rotationEulerDeg: Vec3;
      scale: Vec3;
    };
  };
  alignment: {
    surveyRef: string;
    manifestUri: string;
    maxWallDeltaM: number;
    verifiedAt?: string;
    parityReportUri?: string;
  };
  bounds?: {
    min: Vec3;
    max: Vec3;
    extentM: Vec3;
  };
}

export interface HouseLayout {
  schemaVersion: number;
  metadata: {
    name: string;
    units: string;
    origin?: { label: string; position: Vec3; documentationRef?: string };
    sources?: Array<{ title: string; uri: string; scaleVerified?: boolean; notes?: string }>;
  };
  rooms: Array<{
    id: string;
    label: string;
    floorPolygon: Vec2[];
    floorElevation: number;
    documentationRef?: string;
  }>;
  stations: Array<{
    stationId: string;
    roomId: string;
    position: Vec3;
    matterNodeId: number;
    label?: string;
  }>;
  geometry?: HouseLayoutGeometry;
}
