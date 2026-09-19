"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const map_service_1 = require("./map.service");
const public_decorator_1 = require("../common/decorators/public.decorator");
let MapController = class MapController {
    constructor(mapService) {
        this.mapService = mapService;
    }
    getDashboardStats() {
        return this.mapService.getDashboardStatistics();
    }
    getCoverage() {
        return this.mapService.getCoverage();
    }
    getRegionStatistics() {
        return this.mapService.getRegionStatistics();
    }
};
exports.MapController = MapController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('dashboard/live'),
    (0, swagger_1.ApiOperation)({ summary: 'Jonli monitoring paneli statistikasi (Live Dashboard Telemetry)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Qamrab olingan qishloqlar, tekshirilgan bemorlar, zudlik talab holatlar' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MapController.prototype, "getDashboardStats", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('coverage'),
    (0, swagger_1.ApiOperation)({ summary: 'O‘zbekiston viloyatlari bo‘yicha mobil diagnostika qamrovi' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MapController.prototype, "getCoverage", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('regions/statistics'),
    (0, swagger_1.ApiOperation)({ summary: 'Hududlar va xavf darajalari bo‘yicha to‘liq tibbiy statistika' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MapController.prototype, "getRegionStatistics", null);
exports.MapController = MapController = __decorate([
    (0, swagger_1.ApiTags)('Uzbekistan Map & GIS Telemetry'),
    (0, common_1.Controller)('map'),
    __metadata("design:paramtypes", [map_service_1.MapService])
], MapController);
//# sourceMappingURL=map.controller.js.map