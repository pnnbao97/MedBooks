'use server'

const createBook = async(params: BookParams) {
    try {

    } catch (error) {
        console.log(error)

        return {
            success: false,
            message: 'Đã có lỗi khi tạo sách mới'
        }
    }
}