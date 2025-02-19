import { Component } from '@angular/core';
import * as XLSX from 'xlsx';

interface OrgEntry {
  email: string;
  fullName: string;
  role: string;
  reportsTo: string;
}

@Component({
  selector: 'app-org-validator',
  templateUrl: './org-validator.component.html',
  styleUrls: ['./org-validator.component.scss'],
})  
export class OrgValidatorComponent {
  uploadedData: OrgEntry[] = [];
  errorMessages: string[] = [];

  onFileUpload(event: any): void {
    const target: DataTransfer = <DataTransfer>event.target;
    if (target.files.length !== 1) {
      this.uploadedData = [];
      this.errorMessages = [];
      alert('Please upload only one file at a time.');
      return;
    }

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];
      const data: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });

      this.processExcelData(data);
    };
    reader.readAsBinaryString(target.files[0]);
  }

  processExcelData(data: any[]): void {
    this.uploadedData = [];
    this.errorMessages = [];

    const headers = data[0].map((h: any) => h.toLowerCase().trim());
    if (
      !headers.includes('email') ||
      !headers.includes('fullname') ||
      !headers.includes('role') ||
      !headers.includes('reportsto')
    ) {
      this.errorMessages.push(
        'Invalid file format. Make sure the headers are: Email, FullName, Role, ReportsTo.'
      );
      return;
    }

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      this.uploadedData.push({
        email: row[0]?.trim() || '',
        fullName: row[1]?.trim() || '',
        role: row[2]?.trim() || '',
        reportsTo: row[3]?.trim() || '',
      });
    }

    this.validateData();
  }

  validateData(): void {
    this.errorMessages = [];
    const roleHierarchy: any = {
      Root: ['Admin'],
      Admin: ['Manager'],
      Manager: ['Manager', 'Caller'],
      Caller: [],
    };
  
    const usersMap = new Map<string, OrgEntry>();
    this.uploadedData.forEach((user) => usersMap.set(user.email, user));
  
    const detectCycle = (email: string, visited: Set<string>, stack: Set<string>): boolean => {
      if (stack.has(email)) return true; 
      if (visited.has(email)) return false;
  
      visited.add(email);
      stack.add(email);
  
      const user = usersMap.get(email);
      if (user) {
        const reportsToArray = user.reportsTo.split(';').map((r) => r.trim());
        for (const reportsToEmail of reportsToArray) {
          if (usersMap.has(reportsToEmail) && detectCycle(reportsToEmail, visited, stack)) {
            return true;
          }
        }
      }
  
      stack.delete(email);
      return false;
    };
  
    const visited = new Set<string>();
    for (const user of this.uploadedData) {
      const stack = new Set<string>();
      if (detectCycle(user.email, visited, stack)) {
        this.errorMessages.push(
          `Cycle detected involving ${user.email} (${user.fullName}). Reporting structure contains a loop.`
        );
      }
    }
  
    for (let i = 0; i < this.uploadedData.length; i++) {
      const user = this.uploadedData[i];
      const rowIndex = i + 1;
  
      if (user.role === 'Root') continue;
      const reportsToArray = user.reportsTo.split(';').map((r) => r.trim());
      if (reportsToArray.length > 1) {
        this.errorMessages.push(
          `Row ${rowIndex} (${user.email}): ${user.fullName} (${user.role}) is reporting to multiple users: ${user.reportsTo}`
        );
        continue;
      }
  
      const reportsToEmail = reportsToArray[0];
      const parentUser = usersMap.get(reportsToEmail);
  
      if (!parentUser) continue;
  
      const parentRole = parentUser.role;
  
      if (user.role === 'Admin' && parentRole !== 'Root') {
        this.errorMessages.push(
          `Row ${rowIndex} (${user.email}): ${user.fullName} (Admin) must report to Root (${parentUser.fullName}), not ${parentRole}.`
        );
      }
  
      if (user.role === 'Manager' && !['Admin', 'Manager'].includes(parentRole)) {
        this.errorMessages.push(
          `Row ${rowIndex} (${user.email}): ${user.fullName} (Manager) cannot report to ${parentUser.fullName} (${parentRole}).`
        );
      }
  
      if (user.role === 'Caller' && parentRole !== 'Manager') {
        this.errorMessages.push(
          `Row ${rowIndex} (${user.email}): ${user.fullName} (Caller) cannot report to ${parentUser.fullName} (${parentRole}).`
        );
      }
    }
  }
}
