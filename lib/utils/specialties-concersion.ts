// Medical specialties mapping
const medicalSpecialties = [
  { value: "noi-khoa", label: "Nội khoa" },
  { value: "ngoai-khoa", label: "Ngoại khoa" },
  { value: "san-phu-khoa", label: "Sản phụ khoa" },
  { value: "nhi-khoa", label: "Nhi khoa" },
  { value: "nhan-khoa", label: "Nhãn khoa" },
  { value: "tai-mui-hong", label: "Tai mũi họng" },
  { value: "da-lieu", label: "Da liễu" },
  { value: "tinh-than", label: "Tâm thần" },
  { value: "than-kinh", label: "Thần kinh" },
  { value: "tim-mach", label: "Tim mạch" },
  { value: "ho-hap", label: "Hô hấp" },
  { value: "tieu-hoa", label: "Tiêu hóa" },
  { value: "noi-tiet", label: "Nội tiết" },
  { value: "than-tiet-nieu", label: "Thận - Tiết niệu" },
  { value: "co-xuong-khop", label: "Cơ xương khớp" },
  { value: "ung-buou", label: "Ung bướu" },
  { value: "gay-me-hoi-suc", label: "Gây mê hồi sức" },
  { value: "cap-cuu", label: "Cấp cứu" },
  { value: "truyen-nhiem", label: "Truyền nhiễm" },
  { value: "cdha", label: "Chẩn đoán hình ảnh" },
  { value: "huyet-hoc", label: "Huyết học" },
  { value: "co-so", label: "Y học cơ sở" },
  { value: "y-hoc-gia-dinh", label: "Y học gia đình" }
];

export const getSpecialtyLabel = (value: string) => {
  const specialty = medicalSpecialties.find(s => s.value === value);
  return specialty ? specialty.label : value;
};