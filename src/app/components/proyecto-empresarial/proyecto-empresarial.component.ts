import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator, MatTableDataSource, MatSort, MatDialog, MatDialogRef } from '@angular/material';
import {PpempresarialModel, Student } from '../../interfaces/app.dataSistemas.interface';
import { RestService } from "../../service/rest.service"
import { BehaviorSubject } from 'rxjs'
// import { AddsisComponent } from '../sistemas/addsis/addsis.component'
// import { EditsisComponent } from '../sistemas/editsis/editsis.component';
// import { DelsisComponent } from '../sistemas/delsis/delsis.component';
import { AddproyectoEmpresarialComponent } from '../proyecto-empresarial/addproyecto-empresarial/addproyecto-empresarial.component'
import { EditproyectoEmpresarialComponent } from '../proyecto-empresarial/editproyecto-empresarial/editproyecto-empresarial.component';
import { DelproyectoEmpresarialComponent } from '../proyecto-empresarial/delproyecto-empresarial/delproyecto-empresarial.component';
import { filter } from 'rxjs/internal/operators/filter';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
@Component({
  selector: 'app-proyecto-empresarial',
  templateUrl: './proyecto-empresarial.component.html',
  styleUrls: ['./proyecto-empresarial.component.scss']
})
export class ProyectoEmpresarialComponent implements OnInit {

  centros: any;
  estudiantes: any =[];
  estudiante1: Student={
    id:0,
    identificacion:"",
    nombre:"",
    nombre2:"",
    apellido1:"",
    apellido2:"",
  }

  // Seting Angular Material
  displayedColumns: string[] = ['id', 'titulo', 'analisis','objetivo','descripcion','indicador','medicion','meta','fuenteDatos','presupuesto','beneficiosEsperados','prioridad','opciones'];
  // displayedColumns: string[] = ['id', 'descripcion', 'duenoObra', 'rut', 'opciones'];
  public dataSource = new MatTableDataSource<PpempresarialModel>();
  public data: any;

  //declaracion de dialogos
  FormAdd: MatDialogRef<AddproyectoEmpresarialComponent>
  FormDel: MatDialogRef<DelproyectoEmpresarialComponent>
  FormEdit: MatDialogRef<EditproyectoEmpresarialComponent>

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  mostrarMensajeFiltro: boolean;
  dataCentros: PpempresarialModel[];
  index: number;
  id: number;

  constructor(private api: RestService, public dialog: MatDialog) {

  }

  ngOnInit() {
    this.cargarCentros();
    this.cargarestudiante()
    console.log(this.estudiantes);
   

  }

  // Buscador/Filtro en Tabla
  doFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLocaleLowerCase();
    if (this.dataSource.filteredData.length == 0) {
      this.mostrarMensajeFiltro = true;
    } else {
      this.mostrarMensajeFiltro = false;
    }
  }

  // Paginador de Tabla Sistemas
  ngAfterViewInit() {
    this.setPaginator();
  }

  setPaginator() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    const RangeLabel = (page: number, pageSize: number, length: number) => {
      if (length == 0 || pageSize == 0) { return `0 de ${length}`; }
      length = Math.max(length, 0);
      const startIndex = page * pageSize;
      // If the start index exceeds the list length, do not try and fix the end index to the end.
      const endIndex = startIndex < length ?
        Math.min(startIndex + pageSize, length) :
        startIndex + pageSize;
      return `${startIndex + 1} - ${endIndex} de ${length}`;
    }

    this.paginator._intl.itemsPerPageLabel = 'Items por Página';
    this.paginator._intl.firstPageLabel = 'Primera Página';
    this.paginator._intl.previousPageLabel = 'Página Anterior';
    this.paginator._intl.nextPageLabel = 'Página Siguiente';
    this.paginator._intl.lastPageLabel = 'Última Página';
    this.paginator._intl.getRangeLabel = RangeLabel;
  }

  setData() {
    //tomar todo lo hay en data y llevarlo a dataSource
    console.log("creamos dataSource con data ->", this.data);
    this.dataSource = new MatTableDataSource(this.data);
    this.setPaginator();

  }


  // Carga de Listado de Centros de Gestión
  cargarCentros() {
    this.api.getData('business_project_plans').subscribe((data: any) => {
      //data acumula todo dato que el servicio tenga
      this.data = data;
      console.log("cargarCentros... " + this.data);
      //iniciamos dataSource
      this.setData();
    }, error => {
      console.log(error);
    });
  }

  cargarbp() {
    this.api.getData("business_project_plans").subscribe(
      (data: PpempresarialModel[]) => {
        this.dataSource.data =data;
    }, error => {
      console.log(error);
    }
    );
  }
  donwloadPDF(){
    const doc = new jsPDF('p', 'mm', 'a2');
    doc.autoTable({html: '#reuniones'});
    doc.save('reuniones.pdf');
    
  }

  cargarestudiante(){
    this.api.getData("business_project_plans/students").subscribe((data:{})=>{
      this.estudiantes = data
    })
  }

  // Agrega un Centro
  addCentros() {

    this.FormAdd = this.dialog.open(AddproyectoEmpresarialComponent, {
      width: '350px',
      data: {}
    });

    this.FormAdd.afterClosed().subscribe(res => {
      //recibe data desde dialogo add
      //controlar aquí si dialogo tiene algún error
      let target: any = {};
      target = res;

      //al parecer el servicio no trae los datos actualizados, por ende agrego el registro con push al array
      //que estamos tomando como recurso para iniciar el dataSource

      // this.data.push(target);
      // this.setData();
      this.cargarbp();

    });


  }

  // Editar un Sistema
  editarCentro(centro:  PpempresarialModel) {
    const dialogRef = this.dialog.open(EditproyectoEmpresarialComponent, {
      width: '350px',
      data: {
        data: centro
      }
    });

    this.FormEdit.afterClosed().subscribe(result => {
      console.log('Dialog closed');
      console.log(result);
      let target: any = {};
      
      this.data.push(target);
      this.setData();
      this.cargarbp();

      // this.pageRefresh();
    });
  }

  // Borrar un Centro de Gestión
  // deleteCentros(index: number, id: number, descripcion: string, duenoObra: string, rut: string) {
  deleteCentros(index: number, id: number, titulo: string) {
    this.index = index;
    this.id = id;
    this.FormDel = this.dialog.open(DelproyectoEmpresarialComponent, {
      width: '500px',
      data: {
        index: index,
        id: id,
        descripcion: titulo,
      }
    });

    this.FormDel.afterClosed().subscribe(result => {
      console.log('Dialog closed');
      console.log(result);
      this.cargarbp();
      //this.pageRefresh();

    });
  }
}