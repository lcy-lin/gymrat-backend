export default function roleIdConverter (id) {
    switch (id) {
        case 1:
            return 'admin';
        case 2:
            return 'user';
        case 3:
            return 'coach';
        case 4:
            return 'student';
        default:
            return 'user';
    }
}